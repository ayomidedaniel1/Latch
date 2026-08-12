#!/usr/bin/env node
import { printHelp, RED, YELLOW } from './format.js';
import { connectTunnel } from './commands/tunnel.js';
import { connectListen } from './commands/listen.js';
import { runReplay } from './commands/replay.js';
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
    command = args[0] || '';
    if (command === 'tunnel' || command === 'listen') {
        projectId = args[1] || '';
    }
    else if (command === 'replay') {
        eventId = args[1] || '';
    }
    else {
        console.error(`${RED}Error: Unknown command '${command}'. Supported commands are 'tunnel', 'listen', and 'replay'.${RESET_TEXT}`);
        printHelp();
        process.exit(1);
    }
    const id = command === 'replay' ? eventId : projectId;
    const idType = command === 'replay' ? 'eventId' : 'projectId';
    if (!id) {
        console.error(`${RED}Error: Missing required argument '${idType}'.${RESET_TEXT}`);
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
        console.error(`${RED}Error: Missing required option '--forward-to' or '-f'.${RESET_TEXT}`);
        process.exit(1);
    }
    return { command, projectId, eventId, forwardTo, token, apiUrl };
}
const RESET_TEXT = '\x1b[0m';
async function main() {
    const { command, projectId, eventId, forwardTo, token, apiUrl } = parseArgs();
    if (!token) {
        console.warn(`${YELLOW}Warning: No CLI token provided. If the project requires authentication, execution will fail.${RESET_TEXT}`);
    }
    if (command === 'tunnel') {
        await connectTunnel(projectId, token, apiUrl, forwardTo);
    }
    else if (command === 'listen') {
        await connectListen(projectId, token, apiUrl, forwardTo);
    }
    else if (command === 'replay') {
        await runReplay(eventId, token, apiUrl, forwardTo);
    }
}
main().catch((err) => {
    console.error(`${RED}Fatal error: ${err instanceof Error ? err.message : err}${RESET_TEXT}`);
    process.exit(1);
});
