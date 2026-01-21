import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';

export async function POST(req: NextRequest) {
    try {
        const port = 9222;
        const profileDir = path.join(os.homedir(), 'Library/Application Support/Google/Chrome/AutomationProfile');

        let chromePath = '';
        if (process.platform === 'darwin') {
            chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
        } else if (process.platform === 'win32') {
            chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
        }

        if (!fs.existsSync(chromePath)) {
            return NextResponse.json({ error: `Chrome tidak ditemukan di: ${chromePath}` }, { status: 404 });
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
