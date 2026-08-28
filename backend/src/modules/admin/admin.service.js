import { query } from "../../config/database.js";

export const getPendingRiders = async () => {
  const result = await query(`
    SELECT
      r.id,
      r.user_id,
      r.full_name,
      r.verification_status,
      r.availability_status,
      r.created_at,
      r.updated_at,
      u.phone,
      u.status AS user_status
    FROM riders r
    JOIN users u ON u.id = r.user_id
    WHERE r.verification_status = 'pending'
    ORDER BY r.created_at ASC
  `);

  return result.rows;
};

export const approveRider = async (riderId) => {
  const result = await query(
    `
      UPDATE riders
      SET
        verification_status = 'approved',
        updated_at = NOW()
      WHERE id = $1
        AND verification_status = 'pending'
      RETURNING
        id,
        user_id,
        full_name,
        verification_status,
        availability_status,
        created_at,
        updated_at
    `,
    [riderId]
  );

  return result.rows[0] || null;
};

export const getPendingVehicles = async () => {
  const result = await query(`
    SELECT
      v.id,
      v.rider_id,
      v.type,
      v.plate_number,
      v.brand,
      v.model,
      v.status,
      v.verification_status,
      v.created_at,
      v.updated_at,
      r.full_name AS rider_name,
      u.phone AS rider_phone
    FROM vehicles v
    JOIN riders r ON r.id = v.rider_id
    JOIN users u ON u.id = r.user_id
    WHERE v.verification_status = 'pending'
    ORDER BY v.created_at ASC
  `);

  return result.rows;
};

export const approveVehicle = async (vehicleId) => {
  const result = await query(
    `
      UPDATE vehicles
      SET
        verification_status = 'approved',
        verified_at = NOW(),
        verification_notes = NULL,
        updated_at = NOW()
      WHERE id = $1
        AND verification_status = 'pending'
      RETURNING
        id,
        rider_id,
        type,
        plate_number,
        brand,
        model,
        status,
        verification_status,
        verified_at,
        verification_notes,
        created_at,
        updated_at
    `,
    [vehicleId]
  );

  return result.rows[0] || null;
};