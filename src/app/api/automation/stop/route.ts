// src/app/api/automation/stop/route.ts
import { engine } from '@/lib/automation-engine';
import { NextResponse } from 'next/server';

export async function POST() {
    await engine.stop();
    return NextResponse.json({ success: true });
}
