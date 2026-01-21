import { chromium, Browser, Page, BrowserContext } from 'playwright';

export interface Log {
    timestamp: string;
    message: string;
    type: 'info' | 'error' | 'success';
    row?: number;
}

export interface AutomationState {
    isRunning: boolean;
    totalRows: number;
    currentRow: number;
    logs: Log[];
    progress: number;
    connectionMode: 'new' | 'attach';
    lastProcessedAkta?: string;
}

class AutomationEngine {
    private browser: Browser | null = null;
    private context: BrowserContext | null = null;
    private isStopping = false;
    private state: AutomationState = {
        isRunning: false,
        totalRows: 0,
        currentRow: 0,
        logs: [],
        progress: 0,
        connectionMode: 'attach',
        lastProcessedAkta: '',
    };

    private subscribers: Set<(state: AutomationState) => void> = new Set();

    getState() {
        return this.state;
    }

    subscribe(callback: (state: AutomationState) => void) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }

    private updateState(update: Partial<AutomationState>) {
        this.state = { ...this.state, ...update };
        this.subscribers.forEach(cb => cb(this.state));
    }

    addLog(message: string, type: 'info' | 'error' | 'success' = 'info', row?: number) {
        console.log(`[${type.toUpperCase()}] ${message}`);
        const log: Log = {
            timestamp: new Date().toLocaleTimeString(),
            message,
            type,
            row,
        };
        this.updateState({
            logs: [...this.state.logs, log].slice(-100),
        });
    }

    async stop() {
        this.isStopping = true;
        this.addLog('Stopping automation...', 'info');
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
        this.updateState({ isRunning: false });
    }

    async run(data: any[], mode: 'new' | 'attach' = 'new', options: { startRow?: number, endRow?: number } = {}) {
        if (this.state.isRunning) {
            this.addLog('Automation is already running', 'error');
            return;
        }

        this.isStopping = false;
        const startIdx = options.startRow ? options.startRow - 1 : 0;
        const endIdx = options.endRow ? options.endRow - 1 : data.length - 1;
        const targetRows = endIdx - startIdx + 1;

        this.updateState({
            isRunning: true,
            totalRows: targetRows,
            currentRow: 0,
            progress: 0,
            logs: [],
            connectionMode: mode,
            lastProcessedAkta: '',
        });

        this.addLog(`Starting automation in ${mode} mode (Rows ${startIdx + 1} to ${endIdx + 1})...`, 'info');

        try {
            if (mode === 'attach') {
                this.addLog('Connecting to http://127.0.0.1:9222...', 'info');
                try {
                    this.browser = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 10000 });
                    const contexts = this.browser.contexts();
                    if (contexts.length === 0) {
                        throw new Error('Chrome terdeteksi tapi tidak ada browser context yang aktif.');
                    }
                    this.context = contexts[0];
                    this.addLog('Connected to Chrome!', 'success');
                } catch (e: any) {
                    const detail = e.message || 'Unknown error';
                    this.addLog(`Detail Gagal: ${detail}`, 'error');

                    let hint = "Pastikan Chrome benar-benar tertutup sebelum dijalankan ulang dengan mode debugging.";
                    if (detail.includes('ECONNREFUSED')) {
                        hint = "Gagal koneksi ke port 9222. Chrome kemungkinan tidak berjalan dalam mode debugging atau ada instance lain yang menghalangi. Gunakan script ./launch-chrome.sh untuk menjalankan Chrome dengan benar.";
                    }

                    throw new Error(`Fatal: Gagal koneksi ke Chrome (9222). ${hint}\nDetail: ${detail}`);
                }
            } else {
                this.addLog('Launching new browser...', 'info');
                this.browser = await chromium.launch({ headless: false, slowMo: 300 });
                this.context = await this.browser.newContext();
            }

            let page: Page;
            if (mode === 'attach' && this.context) {
                const pages = this.context.pages();
                // Prioritaskan tab yang sudah ada website target
                const targetPatterns = ['dkjpasti.kemenkum.go.id', 'ahu.go.id'];
                page = (pages.find(p => targetPatterns.some(pattern => p.url().includes(pattern))) ||
                    pages.find(p => !p.url().includes('localhost')) ||
                    pages[0]) as Page;

                if (!page) page = await this.context.newPage();
                this.addLog(`Menggunakan tab: ${page.url().substring(0, 50)}...`, 'info');
            } else if (this.context) {
                page = await this.context.newPage();
                await page.goto('https://dkjpasti.kemenkum.go.id/notaris/laporan');
            } else {
                throw new Error('Context tidak terinisialisasi');
            }

            for (let i = startIdx; i <= endIdx; i++) {
                if (this.isStopping) break;

                const row = data[i];
                const tglAkta = row[2] || 'N/A';
                const processedCount = i - startIdx + 1;

                this.updateState({
                    currentRow: processedCount,
                    progress: Math.floor((processedCount / targetRows) * 100),
                    lastProcessedAkta: tglAkta
                });

                const noAkta = row[0] || 'Tanpa No';
                try {
                    await this.processRow(page, row, i + 1);
                    this.addLog(`Baris ${i + 1} dan Nomor Akta (${noAkta}) - Selesai`, 'success', i + 1);
                } catch (error: any) {
                    this.addLog(`Error Baris ${i + 1} dan (${noAkta}): ${error.message}`, 'error', i + 1);
                    if (error.message.includes('Browser closed')) break;
                }
            }

            this.addLog(`Automation Selesai (Baris ${startIdx + 1} s/d ${endIdx + 1})`, 'success');
        } catch (error: any) {
            this.addLog(`Fatal Error: ${error.message}`, 'error');
        } finally {
            if (mode === 'new' && this.browser) {
                await this.browser.close();
                this.browser = null;
            }
            this.updateState({ isRunning: false });
        }
    }

    private async processRow(page: Page, col: string[], rowNum: number) {
        // Tombol "Tambahkan Baru"
        await page.click('xpath=//*[@id=\"custom-content-above-home\"]/div/div/div/div/button')
        await page.click('xpath=//*[@id=\"custom-content-above-home\"]/div/div/div/div/div/a/button');

        // await page.getByRole('button', { name: ' Tambah Akta Fidusia' }).click();

        await page.getByLabel('Jenis Akta').selectOption('Akta Fidusia');

        // Tunggu modal muncul
        await page.waitForSelector('#createmodal', { state: 'visible', timeout: 5000 }).catch(() => { });

        const injectValue = async (xpath: string, value: string) => {
            try {
                const locator = page.locator(`xpath=${xpath}`);
                await locator.waitFor({ state: 'visible', timeout: 3000 });
                await locator.fill(value);
            } catch (error) {
                // Fallback ke evaluate jika fill gagal
                await page.evaluate(({ xpath, val }) => {
                    const el = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as HTMLInputElement;
                    if (el) {
                        el.value = val;
                        el.dispatchEvent(new Event('input', { bubbles: true }));
                        el.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }, { xpath, val: value });
            }
        };

        const xpaths = {
            noAkta: '//*[@id="createmodal"]/div/div/div[2]/div[9]/div[2]/input',
            namaPenghadap: '//*[@id="createmodal"]/div/div/div[2]/div[10]/div[2]/input',
            tglAkta: '//*[@id="createmodal"]/div/div/div[2]/div[11]/div[2]/input',
            ntpn: '//*[@id="createmodal"]/div/div/div[2]/div[12]/div[2]/input',
            noVoucher: '//*[@id="createmodal"]/div/div/div[2]/div[13]/div[2]/input',
            noSertifikat: '//*[@id="createmodal"]/div/div/div[2]/div[14]/div[2]/input',
            namaPemberi: '//*[@id="createmodal"]/div/div/div[2]/div[15]/div[2]/input',
            kedudukanPemberi: '//*[@id="createmodal"]/div/div/div[2]/div[16]/div[2]/input',
            namaPenerima: '//*[@id="createmodal"]/div/div/div[2]/div[17]/div[2]/input',
            kedudukanPenerima: '//*[@id="createmodal"]/div/div/div[2]/div[18]/div[2]/input',
            namaPendaftar: '//*[@id="createmodal"]/div/div/div[2]/div[20]/div[2]/input',
            tglPendaftaran: '//*[@id="createmodal"]/div/div/div[2]/div[21]/div[2]/input',
            nilaiPenjaminan: '//*[@id="createmodal"]/div/div/div[2]/div[22]/div[2]/input',
            lastField: '//*[@id="createmodal"]/div/div/div[2]/div[25]/div[2]/input'
        };

        await injectValue(xpaths.noAkta, col[0] || '');
        await injectValue(xpaths.namaPenghadap, col[1] || '');
        await injectValue(xpaths.tglAkta, col[2] || '');
        await injectValue(xpaths.ntpn, col[3] || '');
        await injectValue(xpaths.noVoucher, col[4] || '');
        await injectValue(xpaths.noSertifikat, col[5] || '');
        await injectValue(xpaths.namaPemberi, col[6] || '');
        await injectValue(xpaths.kedudukanPemberi, col[7] || '');
        await injectValue(xpaths.namaPenerima, col[8] || '');
        await injectValue(xpaths.kedudukanPenerima, col[9] || '');

        await page.selectOption("#jenis_fidusia", {
            label: "Pendaftar Fidusia",
        });
        await injectValue(xpaths.namaPendaftar, col[11] || '');
        await injectValue(xpaths.tglPendaftaran, col[12] || '');
        await injectValue(xpaths.nilaiPenjaminan, col[13] || '');
        await injectValue(xpaths.lastField, col[16] || '');
        // Submit form
        await page.click('xpath=//*[@id="createmodal"]/div/div/form/div/button[2]');

        // Validasi Ketat: Tunggu pop-up sukses
        try {
            // Kita gunakan selector yang mencari element h2 dengan teks "Sukses"
            const successTitle = await page.waitForSelector('.swal2-title:has-text("Sukses")', { state: 'visible', timeout: 10000 });
            if (!successTitle) throw new Error('Konfirmasi "Sukses" tidak ditemukan');

            // Log internal untuk debugging
            console.log(`[ENGINE] Baris ${rowNum}: Konfirmasi Sukses terdeteksi`);

            // Klik OK pada SweetAlert
            await page.click('button.swal2-confirm');

            // Tunggu modal tertutup sempurna
            await page.waitForSelector('#createmodal', { state: 'hidden', timeout: 5000 }).catch(() => { });
        } catch (error: any) {
            throw new Error(`Data gagal tersimpan atau konfirmasi lambat: ${error.message}`);
        }
    }
}

export const engine = (() => {
    if (typeof global !== 'undefined') {
        const g = global as any;
        if (!g.automationEngine) {
            g.automationEngine = new AutomationEngine();
        }
        return g.automationEngine as AutomationEngine;
    }
    return new AutomationEngine();
})();
