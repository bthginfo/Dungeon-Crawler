CREATE TABLE IF NOT EXISTS crawler_users (
  id uuid PRIMARY KEY,
  username text NOT NULL UNIQUE CHECK (username ~ '^[a-z0-9_-]{3,24}$'),
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS crawler_sessions (
  token_hash text PRIMARY KEY,
  owner uuid NOT NULL REFERENCES crawler_users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS crawler_sessions_owner ON crawler_sessions(owner);
CREATE TABLE IF NOT EXISTS crawler_saves (
  owner uuid NOT NULL REFERENCES crawler_users(id) ON DELETE CASCADE,
  slot smallint NOT NULL CHECK (slot BETWEEN 0 AND 2),
  revision integer NOT NULL CHECK (revision > 0),
  snapshot jsonb NOT NULL,
  previous jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (owner,slot),
  CHECK (pg_column_size(snapshot) <= 262144)
);
CREATE TABLE IF NOT EXISTS crawler_save_receipts (
  owner uuid NOT NULL REFERENCES crawler_users(id) ON DELETE CASCADE,
  mutation_id uuid NOT NULL,
  slot smallint NOT NULL CHECK (slot BETWEEN 0 AND 2),
  revision integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (owner,mutation_id)
);
CREATE INDEX IF NOT EXISTS crawler_receipts_expiry ON crawler_save_receipts(created_at);
CREATE TABLE IF NOT EXISTS crawler_auth_limits (
  key text NOT NULL,
  bucket bigint NOT NULL,
  hits integer NOT NULL,
  PRIMARY KEY(key,bucket)
);
