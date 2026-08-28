BEGIN;

ALTER TABLE rides
  ADD COLUMN vehicle_id UUID
    REFERENCES vehicles(id)
    ON DELETE SET NULL;

CREATE INDEX rides_vehicle_id_idx
  ON rides (vehicle_id);

COMMIT;
