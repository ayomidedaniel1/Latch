import { Readable } from 'stream';
import { forwardWebhook } from '../forward.js';
import { RESET, BOLD, DIM, GREEN, RED, YELLOW, CYAN } from '../format.js';
export async function connectListen(projectId, token, apiUrl, forwardTo) {
    let lastEventId = null;
    let retryDelay = 5000;
    console.log(`${BOLD}${CYAN}🚀 Starting Latch CLI Listener...${RESET}`);
    console.log(`${DIM}Project ID:${RESET}   ${projectId}`);
    console.log(`${DIM}Forward to:${RESET}   ${forwardTo}`);
    console.log(`${DIM}Latch server:${RESET} ${apiUrl}\n`);
    while (true) {
        try {
            const url = new URL(`/api/events/stream`, apiUrl);
            url.searchParams.set('projectId', projectId);
            const headers = {
                'Accept': 'text/event-stream',
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            if (lastEventId) {
                headers['Last-Event-ID'] = lastEventId;
            }
            const response = await fetch(url.toString(), { headers });
            if (response.status === 401) {
                console.error(`\n${RED}${BOLD}[Error] Unauthorized (401).${RESET}`);
                console.error(`${RED}Your CLI token is invalid or may have been rotated. Check the project dashboard to copy your latest token.${RESET}`);
                process.exit(1);
            }
            if (!response.ok) {
                const text = await response.text().catch(() => '');
                throw new Error(`HTTP ${response.status} - ${text || response.statusText}`);
            }
            console.log(`${GREEN}✔ Connected! Listening for webhooks...${RESET}\n`);
            retryDelay = 5000;
            if (!response.body) {
                throw new Error('Response body is null');
            }
            const stream = Readable.fromWeb(response.body);
            let buffer = '';
            for await (const chunk of stream) {
                const chunkString = chunk.toString();
                buffer += chunkString;
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed)
                        continue;
                    if (trimmed.startsWith('id:')) {
                        lastEventId = trimmed.substring(3).trim();
                    }
                    else if (trimmed.startsWith('data:')) {
                        const dataStr = trimmed.substring(5).trim();
                        if (dataStr === 'connected')
                            continue;
                        try {
                            const parsed = JSON.parse(dataStr);
                            // Skip dashboard-internal status messages
                            if (parsed && parsed.type === 'cli-status')
                                continue;
                            const event = parsed;
                            await forwardWebhook(event, forwardTo);
                        }
                        catch (err) {
                            console.error(`${YELLOW}Failed to parse streaming payload: ${err instanceof Error ? err.message : err}${RESET}`);
                        }
                    }
                }
            }
            console.log(`\n${YELLOW}Connection closed by server. Reconnecting...${RESET}`);
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error(`${RED}Connection error: ${msg}. Reconnecting in ${retryDelay / 1000}s...${RESET}`);
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
            retryDelay = Math.min(retryDelay * 1.5, 30000);
        }
    }
}
