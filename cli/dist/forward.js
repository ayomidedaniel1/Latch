import { RESET, BOLD, DIM, GREEN, RED, BLUE } from './format.js';
export async function forwardWebhook(event, forwardTo) {
    const start = Date.now();
    const eventId = event.id || 'evt_tunnel';
    const timestamp = new Date(event.received_at || event.receivedAt || Date.now()).toLocaleTimeString();
    const method = event.method || 'POST';
    const rawBody = event.raw_body ?? event.raw ?? (typeof event.body === 'string' ? event.body : JSON.stringify(event.body ?? {}));
    console.log(`[${DIM}${timestamp}${RESET}] [${BLUE}Event ${eventId.slice(0, 8)}${RESET}] Forwarding ${BOLD}${method}${RESET} request...`);
    // Clean hop-by-hop/platform headers
    const forwardHeaders = { ...event.headers };
    delete forwardHeaders['host'];
    delete forwardHeaders['connection'];
    delete forwardHeaders['content-length'];
    // Add Latch metadata
    forwardHeaders['x-latch-forwarded'] = 'true';
    forwardHeaders['x-latch-event-id'] = eventId;
    forwardHeaders['x-webhook-replay'] = 'true';
    let status = 500;
    let duration = 0;
    try {
        const response = await fetch(forwardTo, {
            method,
            headers: forwardHeaders,
            body: rawBody,
        });
        duration = Date.now() - start;
        status = response.status;
        const responseText = await response.text().catch(() => '');
        const isSuccess = response.status >= 200 && response.status < 300;
        const statusColor = isSuccess ? GREEN : RED;
        console.log(`[${DIM}${timestamp}${RESET}] [${BLUE}Event ${eventId.slice(0, 8)}${RESET}] Forwarded to ${BOLD}${forwardTo}${RESET} -> ${statusColor}${response.status} ${response.statusText}${RESET} (${duration}ms)`);
        if (!isSuccess && responseText) {
            console.log(`      ${DIM}Response snippet: ${responseText.slice(0, 150).trim().replace(/\n/g, ' ')}${RESET}`);
        }
    }
    catch (err) {
        duration = Date.now() - start;
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error(`[${DIM}${timestamp}${RESET}] [${BLUE}Event ${eventId.slice(0, 8)}${RESET}] ${RED}Failed to forward to ${forwardTo} -> ${errorMessage}${RESET} (${duration}ms)`);
    }
    return { status, duration };
}
