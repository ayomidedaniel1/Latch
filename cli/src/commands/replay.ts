import { forwardWebhook, WebhookEvent } from '../forward.js';
import { RESET, BOLD, DIM, GREEN, RED, CYAN } from '../format.js';

export async function runReplay(eventId: string, token: string, apiUrl: string, forwardTo: string) {
  console.log(`${BOLD}${CYAN}🚀 Starting Latch CLI Local Replay...${RESET}`);
  console.log(`${DIM}Event ID:${RESET}     ${eventId}`);
  console.log(`${DIM}Forward to:${RESET}   ${forwardTo}`);
  console.log(`${DIM}Latch server:${RESET} ${apiUrl}\n`);

  try {
    const url = new URL(`/api/events/detail`, apiUrl);
    url.searchParams.set('eventId', eventId);
    if (token) {
      url.searchParams.set('token', token);
    }

    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url.toString(), { headers });

    if (response.status === 401) {
      console.error(`\n${RED}${BOLD}[Error] Unauthorized (401).${RESET}`);
      console.error(`${RED}Your CLI token is invalid. Check the project dashboard to copy your latest token.${RESET}`);
      process.exit(1);
    }

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`HTTP ${response.status} - ${text || response.statusText}`);
    }

    const event: WebhookEvent = await response.json();
    await forwardWebhook(event, forwardTo);
    console.log(`\n${GREEN}✔ Replay completed.${RESET}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`\n${RED}Replay execution failed: ${msg}${RESET}`);
    process.exit(1);
  }
}
