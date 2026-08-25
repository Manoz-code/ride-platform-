

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_role AS ENUM (
    'customer',
    'rider',
    'admin'
);

CREATE TYPE user_status AS ENUM (
    'active',
    'suspended',
    'deactivated'
);

CREATE TYPE rider_verification_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);

CREATE TYPE rider_availability_status AS ENUM (
    'offline',
    'online',
    'busy'
);

CREATE TYPE vehicle_type AS ENUM (
    'bike',
    'car'
);

CREATE TYPE vehicle_status AS ENUM (
    'active',
    'inactive',
    'suspended'
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    password_hash TEXT NOT NULL,
    role user_role NOT NULL,
    status user_status NOT NULL DEFAULT 'active',
    phone_verified_at TIMESTAMPTZ,
    email_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX users_phone_unique
    ON users (phone);

CREATE UNIQUE INDEX users_email_unique
    ON users (LOWER(email))
    WHERE email IS NOT NULL;

CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE
        REFERENCES users(id)
        ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE riders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE
        REFERENCES users(id)
        ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    verification_status rider_verification_status
        NOT NULL DEFAULT 'pending',
    availability_status rider_availability_status
        NOT NULL DEFAULT 'offline',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rider_id UUID NOT NULL
        REFERENCES riders(id)
        ON DELETE CASCADE,
    type vehicle_type NOT NULL,
    plate_number VARCHAR(30) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    status vehicle_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX vehicles_plate_number_unique
    ON vehicles (UPPER(plate_number));

CREATE INDEX vehicles_rider_id_idx
    ON vehicles (rider_id);

CREATE INDEX riders_availability_status_idx
    ON riders (availability_status);

CREATE INDEX riders_verification_status_idx
    ON riders (verification_status);

COMMIT;
