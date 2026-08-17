export const RESET = '\x1b[0m';
export const BOLD = '\x1b[1m';
export const DIM = '\x1b[2m';
export const GREEN = '\x1b[32m';
export const RED = '\x1b[31m';
export const YELLOW = '\x1b[33m';
export const BLUE = '\x1b[34m';
export const CYAN = '\x1b[36m';
export const MAGENTA = '\x1b[35m';

export function printHelp() {
  console.log(`
${BOLD}${GREEN}Latch CLI (Built-in Tunnel, Listener & Replay)${RESET}
Secure real-time local webhook forwarding and manual event replaying without ngrok or Cloudflare.

${BOLD}Usage:${RESET}
  npx @ayomidedaniel/latch-cli tunnel <projectId> --forward-to <localUrl> [options]
  npx @ayomidedaniel/latch-cli listen <projectId> --forward-to <localUrl> [options]
  npx @ayomidedaniel/latch-cli replay <eventId> --forward-to <localUrl> [options]

${BOLD}Commands:${RESET}
  tunnel                   Establish a zero-config built-in tunnel to forward external webhooks to your local machine.
  listen                   Subscribe to live project webhooks and forward to local endpoint.
  replay                   Manually replay a historical webhook event to your local server.

${BOLD}Arguments:${RESET}
  projectId                The UUID of your Latch project (for tunnel/listen).
  eventId                  The UUID of the webhook event to replay (for replay).

${BOLD}Options:${RESET}
  -f, --forward-to <url>   The local endpoint to forward webhooks to (e.g. http://localhost:3000/api/webhook).
  -t, --token <token>      The CLI token for the project (fallback: LATCH_TOKEN env var).
  -u, --api-url <url>      The Latch server URL (default: http://localhost:3000).
  -h, --help               Display this help guide.

${BOLD}Examples:${RESET}
  npx @ayomidedaniel/latch-cli tunnel d3b07384-d113-4956-a5db-e1c725a34e32 -f http://localhost:3000/api/webhook -t sec_token
  npx @ayomidedaniel/latch-cli listen d3b07384-d113-4956-a5db-e1c725a34e32 -f http://localhost:3000/api/webhook -t sec_token
  npx @ayomidedaniel/latch-cli replay a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d -f http://localhost:3000/api/webhook -t sec_token
`);
}
