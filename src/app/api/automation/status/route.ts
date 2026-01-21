import { engine } from '@/lib/automation-engine';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        start(controller) {
            const sendUpdate = (state: any) => {
                try {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(state)}\n\n`));
                } catch (e) {
                    // controller closed
                }
            };

            // Send initial state
            sendUpdate(engine.getState());

            // Subscribe to updates
            const unsubscribe = engine.subscribe((state) => {
                sendUpdate(state);
            });

            // Heartbeat to keep connection alive
            const heartbeat = setInterval(() => {
                try {
                    controller.enqueue(encoder.encode(': heartbeat\n\n'));
                } catch (e) { }
            }, 15000);

            // Cleanup on close
            req.signal.addEventListener('abort', () => {
                clearInterval(heartbeat);
                unsubscribe();
            });
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
