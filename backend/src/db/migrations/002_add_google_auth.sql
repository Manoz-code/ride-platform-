BEGIN;

-- Google accounts do not necessarily have a phone number
-- or a local password.
ALTER TABLE users
  ALTER COLUMN phone DROP NOT NULL,
  ALTER COLUMN password_hash DROP NOT NULL;

-- Authentication providers linked to a platform user.
CREATE TABLE IF NOT EXISTS user_auth_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL
    REFERENCES users(id)
    ON DELETE CASCADE,

  provider VARCHAR(50) NOT NULL,

  provider_user_id VARCHAR(255) NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (provider, provider_user_id)
);

CREATE INDEX IF NOT EXISTS user_auth_providers_user_id_idx
  ON user_auth_providers(user_id);

COMMIT;
