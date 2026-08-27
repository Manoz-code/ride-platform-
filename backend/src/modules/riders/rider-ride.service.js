import { query } from "../../config/database.js";

const getRiderByUserId = async (userId) => {
  const result = await query(
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

  return result.rows[0] || null;
};

export const getAvailableRides = async (userId) => {
  const rider = await getRiderByUserId(userId);

  if (!rider) {
    return null;
  }

  const result = await query(
    `
      SELECT
        id,
        customer_id,
        rider_id,
        pickup_address,
        pickup_latitude,
        pickup_longitude,
        dropoff_address,
        dropoff_latitude,
        dropoff_longitude,
        status,
        requested_at,
        accepted_at,
        started_at,
        completed_at,
        cancelled_at,
        created_at,
        updated_at
      FROM rides
      WHERE status = 'requested'
        AND rider_id IS NULL
      ORDER BY requested_at ASC
    `
  );

  return result.rows;
};

export const acceptRide = async (userId, rideId) => {
  const rider = await getRiderByUserId(userId);

  if (!rider) {
    return null;
  }

  if (rider.verification_status !== "approved") {
    const error = new Error(
      "Rider must be approved before accepting rides."
    );

    error.statusCode = 403;
    throw error;
  }

  if (rider.availability_status !== "online") {
    const error = new Error(
      "Rider must be online before accepting rides."
    );

    error.statusCode = 403;
    throw error;
  }

  const activeRideResult = await query(
    `
      SELECT
        id,
        status
      FROM rides
      WHERE rider_id = $1
        AND status IN ('accepted', 'in_progress')
      LIMIT 1
    `,
    [rider.id]
  );

  if (activeRideResult.rows[0]) {
    const error = new Error(
      "Rider already has an active ride."
    );

    error.statusCode = 409;
    throw error;
  }

  const result = await query(
    `
      UPDATE rides
      SET
        rider_id = $1,
        status = 'accepted',
        accepted_at = NOW(),
        updated_at = NOW()
      WHERE id = $2
        AND status = 'requested'
        AND rider_id IS NULL
      RETURNING
        id,
        customer_id,
        rider_id,
        pickup_address,
        pickup_latitude,
        pickup_longitude,
        dropoff_address,
        dropoff_latitude,
        dropoff_longitude,
        status,
        requested_at,
        accepted_at,
        started_at,
        completed_at,
        cancelled_at,
        created_at,
        updated_at
    `,
    [rider.id, rideId]
  );

  const ride = result.rows[0];

  if (!ride) {
    return null;
  }

  await query(
    `
      UPDATE riders
      SET
        availability_status = 'busy',
        updated_at = NOW()
      WHERE id = $1
    `,
    [rider.id]
  );

  return ride;
};

export const startRide = async (userId, rideId) => {
  const rider = await getRiderByUserId(userId);

  if (!rider) {
    return null;
  }

  const result = await query(
    `
      UPDATE rides
      SET
        status = 'in_progress',
        started_at = NOW(),
        updated_at = NOW()
      WHERE id = $1
        AND rider_id = $2
        AND status = 'accepted'
      RETURNING
        id,
        customer_id,
        rider_id,
        pickup_address,
        pickup_latitude,
        pickup_longitude,
        dropoff_address,
        dropoff_latitude,
        dropoff_longitude,
        status,
        requested_at,
        accepted_at,
        started_at,
        completed_at,
        cancelled_at,
        created_at,
        updated_at
    `,
    [rideId, rider.id]
  );

  return result.rows[0] || null;
};

export const completeRide = async (userId, rideId) => {
  const rider = await getRiderByUserId(userId);

  if (!rider) {
    return null;
  }

  const result = await query(
    `
      UPDATE rides
      SET
        status = 'completed',
        completed_at = NOW(),
        updated_at = NOW()
      WHERE id = $1
        AND rider_id = $2
        AND status = 'in_progress'
      RETURNING
        id,
        customer_id,
        rider_id,
        pickup_address,
        pickup_latitude,
        pickup_longitude,
        dropoff_address,
        dropoff_latitude,
        dropoff_longitude,
        status,
        requested_at,
        accepted_at,
        started_at,
        completed_at,
        cancelled_at,
        created_at,
        updated_at
    `,
    [rideId, rider.id]
  );

  const ride = result.rows[0];

  if (!ride) {
    return null;
  }

  await query(
    `
      UPDATE riders
      SET
        availability_status = 'online',
        updated_at = NOW()
      WHERE id = $1
    `,
    [rider.id]
  );

  return ride;
};