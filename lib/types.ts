export type Project = {
  id: string;
  user_id?: string;
  name: string;
  destination_url?: string | null;
  cli_token: string;
  created_at: string;
};

export type WebhookEvent = {
  id: string;
  method: string;
  headers: Record<string, string>;
  body: unknown;
  raw_body: string;
  source_ip?: string;
  received_at: string;
};

/**
 * Shape of items pushed to the Redis webhook queue.
 * Shared between the ingest route, queue consumer, and worker.
 */
export type WebhookPayload = {
  projectId: string;
  headers: Record<string, string>;
  raw: string;
  receivedAt: string;
  sourceIp: string | null;
};

export type DiffEntryType = 'added' | 'removed' | 'changed' | 'unchanged';

export type DiffEntry = {
  type: DiffEntryType;
  path: string;
  key: string;
  depth: number;
  oldValue?: unknown;
  newValue?: unknown;
};
