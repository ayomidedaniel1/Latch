CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  destination_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  method TEXT NOT NULL DEFAULT 'POST',
  headers JSONB NOT NULL,
  body JSONB,
  raw_body TEXT,
  source_ip TEXT,
  received_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS replays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  destination_url TEXT NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  duration_ms INTEGER,
  replayed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_project_received
  ON events(project_id, received_at DESC);

CREATE INDEX IF NOT EXISTS idx_events_received
  ON events(received_at DESC);
