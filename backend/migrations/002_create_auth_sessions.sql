BEGIN;

CREATE TABLE auth_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    refresh_token_hash CHAR(64) NOT NULL,

    user_agent TEXT,
    ip_address INET,

    expires_at TIMESTAMPTZ NOT NULL,

    revoked_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX auth_sessions_refresh_token_hash_unique
    ON auth_sessions (refresh_token_hash);

CREATE INDEX auth_sessions_user_id_idx
    ON auth_sessions (user_id);

CREATE INDEX auth_sessions_expires_at_idx
    ON auth_sessions (expires_at);

COMMIT;
