// src/app/api/automation/start/route.ts
import { engine } from '@/lib/automation-engine';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { data, mode = 'new', startRow, endRow } = await req.json();
        console.log(`[API] Start requested. Mode: ${mode}, Rows: ${data?.length}, Range: ${startRow}-${endRow}`);

        if (!data || !Array.isArray(data)) {
            console.error('[API] Invalid data format');
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
        }

        // Trigger automation in the background
        engine.run(data, mode, { startRow, endRow }).catch(err => {
            console.error('Automation failed:', err);
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
