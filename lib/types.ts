export type WebhookEvent = {
  id: string;
  method: string;
  headers: Record<string, string>;
  body: unknown;
  raw_body: string;
  received_at: string;
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
