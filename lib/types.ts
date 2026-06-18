export type WebhookEvent = {
  id: string;
  headers: Record<string, string>;
  body: unknown;
  raw_body: string;
  received_at: string;
};
