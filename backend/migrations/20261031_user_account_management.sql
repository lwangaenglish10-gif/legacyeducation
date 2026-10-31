-- LegacyEducation user account management migration
-- Safe to run once against the production PostgreSQL database.
-- Existing users are assigned "active" by default; no account is removed.

BEGIN;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) NOT NULL DEFAULT 'active';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_account_status_check'
      AND conrelid = 'users'::regclass
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_account_status_check
      CHECK (account_status IN ('active', 'suspended'));
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id BIGSERIAL PRIMARY KEY,
  actor_user_id TEXT NOT NULL,
  action VARCHAR(80) NOT NULL,
  target_user_id TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS admin_audit_logs_actor_created_idx
  ON admin_audit_logs (actor_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS admin_audit_logs_target_created_idx
  ON admin_audit_logs (target_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS admin_audit_logs_created_idx
  ON admin_audit_logs (created_at DESC);

COMMIT;
