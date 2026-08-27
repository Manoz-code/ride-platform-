import { query } from "../../config/database.js";

export const getRiderByUserId = async (userId) => {
  const result = await query(
    `
      SELECT
        id,
        user_id,
        full_name,
        verification_status,
        availability_status,
        created_at,
        updated_at
      FROM riders
      WHERE user_id = $1
      LIMIT 1
    `,
    [userId]
  );

  return result.rows[0] || null;
};


export const updateRiderAvailability = async (userId, availabilityStatus) => {
  const riderResult = await query(
    `
      SELECT
        id,
        verification_status,
        availability_status
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

  if (
    availabilityStatus === "online" &&
    rider.verification_status !== "approved"
  ) {
    const error = new Error(
      "Rider must be approved before going online."
    );

    error.statusCode = 403;

    throw error;
  }

  const result = await query(
    `
      UPDATE riders
      SET
        availability_status = $1,
        updated_at = NOW()
      WHERE id = $2
      RETURNING
        id,
        user_id,
        full_name,
        verification_status,
        availability_status,
        created_at,
        updated_at
    `,
    [availabilityStatus, rider.id]
  );

  return result.rows[0] || null;
};