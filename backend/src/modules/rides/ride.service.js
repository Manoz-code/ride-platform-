import { query } from "../../config/database.js";

export const createRide = async ({
  customerId,
  pickupAddress,
  pickupLatitude,
  pickupLongitude,
  dropoffAddress,
  dropoffLatitude,
  dropoffLongitude,
}) => {
 const customerResult = await query(
  `
    SELECT id
    FROM customers
    WHERE user_id = $1
    LIMIT 1
  `,
  [customerId]
);

const customer = customerResult.rows[0];

if (!customer) {
  return null;
}
  const result = await query(
    `
      INSERT INTO rides (
        customer_id,
        pickup_address,
        pickup_latitude,
        pickup_longitude,
        dropoff_address,
        dropoff_latitude,
        dropoff_longitude
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
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
   [
  customer.id,
  pickupAddress,
  pickupLatitude,
  pickupLongitude,
  dropoffAddress,
  dropoffLatitude,
  dropoffLongitude,
]
  );

  return result.rows[0];
};

export const getCustomerRides = async (userId) => {
  const customerResult = await query(
    `
      SELECT id
      FROM customers
      WHERE user_id = $1
      LIMIT 1
    `,
    [userId]
  );

  const customer = customerResult.rows[0];

  if (!customer) {
    return null;
  }

  const ridesResult = await query(
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
      WHERE customer_id = $1
      ORDER BY created_at DESC
    `,
    [customer.id]
  );

  return ridesResult.rows;
};


export const getCustomerRideById = async (userId, rideId) => {
  const customerResult = await query(
    `
      SELECT id
      FROM customers
      WHERE user_id = $1
      LIMIT 1
    `,
    [userId]
  );

  const customer = customerResult.rows[0];

  if (!customer) {
    return null;
  }

  const rideResult = await query(
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
      WHERE id = $1
        AND customer_id = $2
      LIMIT 1
    `,
    [rideId, customer.id]
  );

  return rideResult.rows[0] || null;
};

export const cancelCustomerRide = async (userId, rideId) => {
  const customerResult = await query(
    `
      SELECT id
      FROM customers
      WHERE user_id = $1
      LIMIT 1
    `,
    [userId]
  );

  const customer = customerResult.rows[0];

  if (!customer) {
    return null;
  }

  const rideResult = await query(
    `
      UPDATE rides
      SET
        status = 'cancelled',
        cancelled_at = NOW(),
        updated_at = NOW()
      WHERE id = $1
        AND customer_id = $2
        AND status = 'requested'
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
    [rideId, customer.id]
  );

  return rideResult.rows[0] || null;
};