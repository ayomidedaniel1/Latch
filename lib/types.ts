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
