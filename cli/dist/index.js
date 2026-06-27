#!/usr/bin/env node
import { Readable } from 'stream';
// ANSI Escape Codes for formatting
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const CYAN = '\x1b[36m';
const MAGENTA = '\x1b[35m';
function printHelp() {
    console.log(`
${BOLD}${GREEN}Latch CLI (Local Tunnel Proxy & Replay)${RESET}
Secure real-time local webhook forwarding and manual event replaying without ngrok.

${BOLD}Usage:${RESET}
  npx @ayomidedaniel/latch-cli listen <projectId> --forward-to <localUrl> [options]
  npx @ayomidedaniel/latch-cli replay <eventId> --forward-to <localUrl> [options]

${BOLD}Arguments:${RESET}
  projectId                The UUID of your Latch project (for listen).
  eventId                  The UUID of the webhook event to replay (for replay).

${BOLD}Options:${RESET}
  -f, --forward-to <url>   The local endpoint to forward webhooks to (e.g. http://localhost:3000/api/webhook).
  -t, --token <token>      The CLI token for the project (fallback: LATCH_TOKEN env var).
  -u, --api-url <url>      The Latch server URL (default: http://localhost:3000).
  -h, --help               Display this help guide.

${BOLD}Examples:${RESET}
  npx @ayomidedaniel/latch-cli listen d3b07384-d113-4956-a5db-e1c725a34e32 -f http://localhost:3000/api/webhook -t sec_token
  npx @ayomidedaniel/latch-cli replay a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d -f http://localhost:3000/api/webhook -t sec_token
`);
}
function parseArgs() {
    const args = process.argv.slice(2);
    let command = '';
    let projectId = '';
    let eventId = '';
    let forwardTo = '';
    let token = process.env.LATCH_TOKEN || '';
    let apiUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    if (args.includes('-h') || args.includes('--help') || args.length === 0) {
        printHelp();
        process.exit(0);
    }
    // Expecting command structure: <listen|replay> <id>
    command = args[0] || '';
    if (command === 'listen') {
        projectId = args[1] || '';
    }
    else if (command === 'replay') {
        eventId = args[1] || '';
    }
    else {
        console.error(`${RED}Error: Unknown command. Supported commands are 'listen' and 'replay'.${RESET}`);
        printHelp();
        process.exit(1);
    }
    const id = command === 'listen' ? projectId : eventId;
    const idType = command === 'listen' ? 'projectId' : 'eventId';
    if (!id) {
        console.error(`${RED}Error: Missing required argument '${idType}'.${RESET}`);
        printHelp();
        process.exit(1);
    }
    for (let i = 2; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--forward-to' || arg === '-f') {
            forwardTo = args[i + 1] || '';
            i++;
        }
        else if (arg === '--token' || arg === '-t') {
            token = args[i + 1] || '';
            i++;
        }
        else if (arg === '--api-url' || arg === '-u') {
            apiUrl = args[i + 1] || '';
            i++;
        }
    }
    if (!forwardTo) {
        console.error(`${RED}Error: Missing required option '--forward-to' or '-f'.${RESET}`);
        process.exit(1);
    }
    return { command, projectId, eventId, forwardTo, token, apiUrl };
}
async function forwardWebhook(event, forwardTo) {
    const start = Date.now();
    const timestamp = new Date(event.received_at).toLocaleTimeString();
    console.log(`[${DIM}${timestamp}${RESET}] [${BLUE}Event ${event.id.slice(0, 8)}${RESET}] Forwarding ${BOLD}${event.method}${RESET} request...`);
    // Clean hop-by-hop/platform headers
    const forwardHeaders = { ...event.headers };
    delete forwardHeaders['host'];
    delete forwardHeaders['connection'];
    delete forwardHeaders['content-length'];
    // Add Latch metadata
    forwardHeaders['x-latch-forwarded'] = 'true';
    forwardHeaders['x-latch-event-id'] = event.id;
    forwardHeaders['x-webhook-replay'] = 'true';
    try {
        const response = await fetch(forwardTo, {
            method: event.method || 'POST',
            headers: forwardHeaders,
            body: event.raw_body,
        });
        const duration = Date.now() - start;
        const responseText = await response.text().catch(() => '');
        const isSuccess = response.status >= 200 && response.status < 300;
        const statusColor = isSuccess ? GREEN : RED;
        console.log(`[${DIM}${timestamp}${RESET}] [${BLUE}Event ${event.id.slice(0, 8)}${RESET}] Forwarded to ${BOLD}${forwardTo}${RESET} -> ${statusColor}${response.status} ${response.statusText}${RESET} (${duration}ms)`);
        if (!isSuccess && responseText) {
            console.log(`      ${DIM}Response snippet: ${responseText.slice(0, 150).trim().replace(/\n/g, ' ')}${RESET}`);
        }
    }
    catch (err) {
        const duration = Date.now() - start;
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error(`[${DIM}${timestamp}${RESET}] [${BLUE}Event ${event.id.slice(0, 8)}${RESET}] ${RED}Failed to forward to ${forwardTo} -> ${errorMessage}${RESET} (${duration}ms)`);
    }
}
async function connectSSE(projectId, token, apiUrl, forwardTo) {
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
            if (token) {
                url.searchParams.set('token', token);
            }
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
            retryDelay = 5000; // reset retry delay on successful connection
            if (!response.body) {
                throw new Error('Response body is null');
            }
            // Convert response.body into a Readable stream to process chunks in Node
            const stream = Readable.fromWeb(response.body);
            let buffer = '';
            for await (const chunk of stream) {
                const chunkString = chunk.toString();
                buffer += chunkString;
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // Keep the last incomplete line in the buffer
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
                            const event = JSON.parse(dataStr);
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
            // exponential backoff up to 30 seconds
            retryDelay = Math.min(retryDelay * 1.5, 30000);
        }
    }
}
async function main() {
    const { command, projectId, eventId, forwardTo, token, apiUrl } = parseArgs();
    if (!token) {
        console.warn(`${YELLOW}Warning: No CLI token provided. If the project requires authentication, execution will fail.${RESET}`);
    }
    if (command === 'listen') {
        await connectSSE(projectId, token, apiUrl, forwardTo);
    }
    else if (command === 'replay') {
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
            const headers = {
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
            const event = await response.json();
            await forwardWebhook(event, forwardTo);
            console.log(`\n${GREEN}✔ Replay completed.${RESET}`);
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error(`\n${RED}Replay execution failed: ${msg}${RESET}`);
            process.exit(1);
        }
    }
}
main().catch((err) => {
    console.error(`${RED}Fatal error: ${err instanceof Error ? err.message : err}${RESET}`);
    process.exit(1);
});
