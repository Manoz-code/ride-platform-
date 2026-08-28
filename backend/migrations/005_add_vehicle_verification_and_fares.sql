BEGIN;

CREATE TYPE vehicle_verification_status AS ENUM (
  'pending',
  'approved',
  'rejected'
);

ALTER TABLE vehicles
  ADD COLUMN verification_status vehicle_verification_status
    NOT NULL DEFAULT 'pending',
  ADD COLUMN verified_at TIMESTAMPTZ,
  ADD COLUMN verification_notes TEXT;

CREATE INDEX vehicles_verification_status_idx
  ON vehicles (verification_status);

ALTER TABLE rides
  ADD COLUMN service_type vehicle_type
    NOT NULL DEFAULT 'bike';

CREATE INDEX rides_service_type_idx
  ON rides (service_type);

CREATE TABLE fare_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market VARCHAR(100) NOT NULL DEFAULT 'default',
  service_type vehicle_type NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'NPR',

  base_fare NUMERIC(12, 2) NOT NULL CHECK (base_fare >= 0),
  minimum_fare NUMERIC(12, 2) NOT NULL CHECK (minimum_fare >= 0),
  per_km_fare NUMERIC(12, 2) NOT NULL CHECK (per_km_fare >= 0),
  per_minute_fare NUMERIC(12, 2) NOT NULL CHECK (per_minute_fare >= 0),

  free_waiting_minutes INTEGER NOT NULL DEFAULT 3
    CHECK (free_waiting_minutes >= 0),
  waiting_per_minute_fare NUMERIC(12, 2) NOT NULL DEFAULT 0
    CHECK (waiting_per_minute_fare >= 0),

  platform_commission_percent NUMERIC(5, 2) NOT NULL DEFAULT 0
    CHECK (
      platform_commission_percent >= 0
      AND platform_commission_percent <= 100
    ),
  tax_percent NUMERIC(5, 2) NOT NULL DEFAULT 0
    CHECK (tax_percent >= 0 AND tax_percent <= 100),

  max_surge_multiplier NUMERIC(5, 2) NOT NULL DEFAULT 2
    CHECK (max_surge_multiplier >= 1),

  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  effective_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  effective_to TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CHECK (
    effective_to IS NULL
    OR effective_to > effective_from
  )
);

CREATE UNIQUE INDEX fare_rules_one_active_per_market_service_idx
  ON fare_rules (market, service_type)
  WHERE is_active = TRUE;

CREATE TABLE ride_fares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL UNIQUE
    REFERENCES rides(id)
    ON DELETE CASCADE,
  fare_rule_id UUID
    REFERENCES fare_rules(id)
    ON DELETE SET NULL,

  route_provider VARCHAR(50) NOT NULL,
  route_distance_meters INTEGER NOT NULL
    CHECK (route_distance_meters >= 0),
  estimated_duration_seconds INTEGER NOT NULL
    CHECK (estimated_duration_seconds >= 0),

  base_fare NUMERIC(12, 2) NOT NULL CHECK (base_fare >= 0),
  distance_fare NUMERIC(12, 2) NOT NULL CHECK (distance_fare >= 0),
  time_fare NUMERIC(12, 2) NOT NULL CHECK (time_fare >= 0),
  waiting_fare NUMERIC(12, 2) NOT NULL DEFAULT 0
    CHECK (waiting_fare >= 0),
  toll_fare NUMERIC(12, 2) NOT NULL DEFAULT 0
    CHECK (toll_fare >= 0),

  surge_multiplier NUMERIC(5, 2) NOT NULL DEFAULT 1
    CHECK (surge_multiplier >= 1),
  surge_fare NUMERIC(12, 2) NOT NULL DEFAULT 0
    CHECK (surge_fare >= 0),

  subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
  discount_fare NUMERIC(12, 2) NOT NULL DEFAULT 0
    CHECK (discount_fare >= 0),
  tax_fare NUMERIC(12, 2) NOT NULL DEFAULT 0
    CHECK (tax_fare >= 0),
  total_fare NUMERIC(12, 2) NOT NULL CHECK (total_fare >= 0),

  platform_commission_fare NUMERIC(12, 2) NOT NULL DEFAULT 0
    CHECK (platform_commission_fare >= 0),
  rider_earning_fare NUMERIC(12, 2) NOT NULL DEFAULT 0
    CHECK (rider_earning_fare >= 0),

  currency CHAR(3) NOT NULL DEFAULT 'NPR',
  status VARCHAR(20) NOT NULL DEFAULT 'estimated'
    CHECK (status IN ('estimated', 'finalized')),
  quoted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finalized_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ride_fares_fare_rule_id_idx
  ON ride_fares (fare_rule_id);

CREATE TYPE payment_method_type AS ENUM (
  'cash',
  'card',
  'wallet'
);

CREATE TYPE payment_status AS ENUM (
  'pending',
  'paid',
  'failed',
  'refunded'
);

CREATE TABLE ride_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL UNIQUE
    REFERENCES rides(id)
    ON DELETE CASCADE,
  method payment_method_type NOT NULL DEFAULT 'cash',
  status payment_status NOT NULL DEFAULT 'pending',
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  currency CHAR(3) NOT NULL DEFAULT 'NPR',
  provider VARCHAR(100),
  provider_reference VARCHAR(255),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ride_payments_status_idx
  ON ride_payments (status);

COMMIT;
