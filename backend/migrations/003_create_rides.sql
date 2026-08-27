BEGIN;

CREATE TYPE ride_status AS ENUM (
    'requested',
    'accepted',
    'in_progress',
    'completed',
    'cancelled'
);

CREATE TABLE rides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    customer_id UUID NOT NULL
        REFERENCES customers(id)
        ON DELETE RESTRICT,

    rider_id UUID
        REFERENCES riders(id)
        ON DELETE SET NULL,

    pickup_address VARCHAR(255) NOT NULL,
    pickup_latitude DECIMAL(10, 7) NOT NULL,
    pickup_longitude DECIMAL(10, 7) NOT NULL,

    dropoff_address VARCHAR(255) NOT NULL,
    dropoff_latitude DECIMAL(10, 7) NOT NULL,
    dropoff_longitude DECIMAL(10, 7) NOT NULL,

    status ride_status NOT NULL DEFAULT 'requested',

    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX rides_customer_id_idx
    ON rides (customer_id);

CREATE INDEX rides_rider_id_idx
    ON rides (rider_id);

CREATE INDEX rides_status_idx
    ON rides (status);

CREATE INDEX rides_requested_at_idx
    ON rides (requested_at);

COMMIT;
