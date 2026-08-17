import { Readable } from 'stream';
import { forwardWebhook, WebhookEvent } from '../forward.js';
import { RESET, BOLD, DIM, GREEN, RED, YELLOW, CYAN } from '../format.js';

export async function connectTunnel(projectId: string, token: string, apiUrl: string, forwardTo: string) {
  let retryDelay = 3000;

  console.log(`${BOLD}${CYAN}🚀 Starting Built-in Latch Tunnel...${RESET}`);
  console.log(`${DIM}Project ID:${RESET}   ${projectId}`);
  console.log(`${DIM}Forward to:${RESET}   ${forwardTo}`);
  console.log(`${DIM}Tunnel Relay:${RESET} ${apiUrl}\n`);

  while (true) {
    try {
      const url = new URL(`/api/tunnel/connect`, apiUrl);
      url.searchParams.set('projectId', projectId);

      const headers: Record<string, string> = {
        'Accept': 'text/event-stream',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url.toString(), { headers });

      if (response.status === 401) {
        console.error(`\n${RED}${BOLD}[Error] Tunnel Unauthorized (401).${RESET}`);
        console.error(`${RED}Your CLI token is invalid or missing. Check project dashboard for token.${RESET}`);
        process.exit(1);
      }

      if (response.status === 429) {
        const errText = await response.text().catch(() => '');
        console.error(`\n${RED}${BOLD}[Error] ${errText || 'Connection limit exceeded'}${RESET}`);
        process.exit(1);
      }

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`HTTP ${response.status} - ${text || response.statusText}`);
      }

      console.log(`${GREEN}✔ Built-in Tunnel Connected! Forwarding external webhooks to ${forwardTo}...${RESET}\n`);
      retryDelay = 3000;

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const stream = Readable.fromWeb(response.body as import('stream/web').ReadableStream<Uint8Array>);
      let buffer = '';

      for await (const chunk of stream) {
        const chunkString = chunk.toString();
        buffer += chunkString;

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          if (trimmed.startsWith('data:')) {
            const dataStr = trimmed.substring(5).trim();

            try {
              const payload = JSON.parse(dataStr);

              if (payload && payload.type === 'status') {
                continue;
              }
              if (payload && payload.type === 'ping') {
                continue;
              }
              if (payload && payload.type === 'warning') {
                console.warn(`${YELLOW}⚠️ ${payload.message}${RESET}`);
                continue;
              }

              // Event payload to forward locally
              const event: WebhookEvent = payload;
              const result = await forwardWebhook(event, forwardTo);

              // Post acknowledgment back to tunnel relay
              if (event.id) {
                const ackUrl = new URL(`/api/tunnel/ack`, apiUrl);
                fetch(ackUrl.toString(), {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                  },
                  body: JSON.stringify({
                    eventId: event.id,
                    projectId,
                    status: result.status,
                    durationMs: result.duration,
                  }),
                }).catch(() => {});
              }
            } catch (err) {
              console.error(`${YELLOW}Failed to process tunnel payload: ${err instanceof Error ? err.message : err}${RESET}`);
            }
          }
        }
      }

      console.log(`\n${YELLOW}Tunnel connection reset by server. Reconnecting...${RESET}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`${RED}Tunnel error: ${msg}. Reconnecting in ${retryDelay / 1000}s...${RESET}`);
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      retryDelay = Math.min(retryDelay * 1.5, 30000);
    }
  }
}
