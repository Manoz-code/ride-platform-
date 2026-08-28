import pool from "../../config/database.js";

export const getVehiclesByUserId = async (userId) => {
  const result = await pool.query(
    `
      SELECT
        v.id,
        v.rider_id,
        v.type,
        v.plate_number,
        v.brand,
        v.model,
        v.status,
        v.verification_status,
        v.verified_at,
        v.verification_notes,
        v.created_at,
        v.updated_at
      FROM vehicles v
      INNER JOIN riders r
        ON r.id = v.rider_id
      WHERE r.user_id = $1
      ORDER BY v.created_at DESC
    `,
    [userId]
  );

  return result.rows;
};

export const createVehicle = async (
  userId,
  { type, plateNumber, brand, model }
) => {
  const riderResult = await pool.query(
    `
      SELECT id
      FROM riders
      WHERE user_id = $1
      LIMIT 1
    `,
    [userId]
  );

  const rider = riderResult.rows[0];

  if (!rider) {
    return null;
  }

  const result = await pool.query(
    `
      INSERT INTO vehicles (
        rider_id,
        type,
        plate_number,
        brand,
        model
      )
      VALUES ($1, $2, $3, $4, $5)
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
    [
      rider.id,
      type,
      plateNumber,
      brand ?? null,
      model ?? null,
    ]
  );

  return result.rows[0];
};

export const updateVehicle = async (
  userId,
  vehicleId,
  data
) => {
  const fields = [];
  const values = [];

  const requiresReapproval =
    data.type !== undefined ||
    data.plateNumber !== undefined ||
    data.brand !== undefined ||
    data.model !== undefined;

  if (data.type !== undefined) {
    values.push(data.type);
    fields.push(`type = $${values.length}`);
  }

  if (data.plateNumber !== undefined) {
    values.push(data.plateNumber);
    fields.push(`plate_number = $${values.length}`);
  }

  if (data.brand !== undefined) {
    values.push(data.brand);
    fields.push(`brand = $${values.length}`);
  }

  if (data.model !== undefined) {
    values.push(data.model);
    fields.push(`model = $${values.length}`);
  }

  if (data.status !== undefined) {
    values.push(data.status);
    fields.push(`status = $${values.length}`);
  }

  if (requiresReapproval) {
    fields.push(`verification_status = 'pending'`);
    fields.push(`verified_at = NULL`);
    fields.push(`verification_notes = NULL`);
  }

  if (fields.length === 0) {
    return null;
  }

  values.push(vehicleId);
  values.push(userId);

  const result = await pool.query(
    `
      UPDATE vehicles v
      SET
        ${fields.join(", ")},
        updated_at = NOW()
      FROM riders r
      WHERE v.id = $${values.length - 1}
        AND v.rider_id = r.id
        AND r.user_id = $${values.length}
      RETURNING
        v.id,
        v.rider_id,
        v.type,
        v.plate_number,
        v.brand,
        v.model,
        v.status,
        v.verification_status,
        v.verified_at,
        v.verification_notes,
        v.created_at,
        v.updated_at
    `,
    values
  );

  return result.rows[0] ?? null;
};