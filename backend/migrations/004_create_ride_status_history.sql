CREATE TABLE IF NOT EXISTS ride_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  ride_id UUID NOT NULL
    REFERENCES rides(id)
    ON DELETE CASCADE,

  status ride_status NOT NULL,

  changed_by_user_id UUID
    REFERENCES users(id)
    ON DELETE SET NULL,

  changed_by_role TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ride_status_history_ride_id
  ON ride_status_history(ride_id);

CREATE INDEX IF NOT EXISTS idx_ride_status_history_created_at
  ON ride_status_history(created_at);
