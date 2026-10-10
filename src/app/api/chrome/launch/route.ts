import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';

export async function POST(req: NextRequest) {
    try {
        const port = 9222;
        const isWindows = process.platform === 'win32';
        const isMac = process.platform === 'darwin';

        let profileDir = '';
        if (isWindows) {
            const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
            profileDir = path.join(localAppData, 'Google', 'Chrome', 'AutomationProfile');
        } else if (isMac) {
            profileDir = path.join(os.homedir(), 'Library', 'Application Support', 'Google', 'Chrome', 'AutomationProfile');
        } else {
            profileDir = path.join(os.homedir(), '.config', 'google-chrome', 'AutomationProfile');
        }

        let chromePath = '';
        if (isMac) {
            chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
        } else if (isWindows) {
            const candidatePaths = [
                path.join(process.env['ProgramFiles'] || 'C:\\Program Files', 'Google', 'Chrome', 'Application', 'chrome.exe'),
                path.join(process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)', 'Google', 'Chrome', 'Application', 'chrome.exe'),
                path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'), 'Google', 'Chrome', 'Application', 'chrome.exe'),
                'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
                'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
            ];
            chromePath = candidatePaths.find(p => fs.existsSync(p)) || candidatePaths[0];
        } else {
            const candidatePaths = [
                '/usr/bin/google-chrome',
                '/usr/bin/google-chrome-stable',
                '/usr/bin/chromium-browser',
                '/usr/bin/chromium'
            ];
            chromePath = candidatePaths.find(p => fs.existsSync(p)) || candidatePaths[0];
        }

        if (!fs.existsSync(chromePath)) {
            return NextResponse.json({ 
                error: `Chrome tidak ditemukan di sistem. Pastikan Google Chrome sudah terpasang.` 
            }, { status: 404 });
        }

        if (!fs.existsSync(profileDir)) {
            fs.mkdirSync(profileDir, { recursive: true });
        }

        console.log(`[API] Launching Chrome: ${chromePath} --remote-debugging-port=${port}`);

        const browser = spawn(chromePath, [
            `--remote-debugging-port=${port}`,
            `--user-data-dir=${profileDir}`,
            '--no-first-run',
            '--no-default-browser-check'
        ], {
            detached: true,
            stdio: 'ignore'
        });

        browser.unref();

        return NextResponse.json({ success: true, message: 'Chrome launched' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
