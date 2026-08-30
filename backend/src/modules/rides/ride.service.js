
import pool, { query } from "../../config/database.js";
import { emitToRiders } from "../../realtime/socket.js";

export const recordRideStatusChange = async ({
  rideId,
  status,
  changedByUserId,
  changedByRole,
}) => {
  await query(
    `
      INSERT INTO ride_status_history (
        ride_id,
        status,
        changed_by_user_id,
        changed_by_role
      )
      VALUES ($1, $2, $3, $4)
    `,
    [rideId, status, changedByUserId, changedByRole]
  );
};

const RIDE_COLUMNS = `
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
`;

export const createRide = async ({
  customerId,
  pickupAddress,
  pickupLatitude,
  pickupLongitude,
  dropoffAddress,
  dropoffLatitude,
  dropoffLongitude,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const customerResult = await client.query(
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
      await client.query("ROLLBACK");
      return null;
    }

    const rideResult = await client.query(
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
          ${RIDE_COLUMNS}
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

    const ride = rideResult.rows[0];

    await client.query(
      `
        INSERT INTO ride_status_history (
          ride_id,
          status,
          changed_by_user_id,
          changed_by_role
        )
        VALUES ($1, 'requested', $2, 'customer')
      `,
      [ride.id, customerId]
    );

    await client.query("COMMIT");

    // Notify all connected riders only after the ride
    // and its initial status history have been committed.
    emitToRiders("ride:requested", {
      ride,
    });

    return ride;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
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
        ${RIDE_COLUMNS}
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
        r.id,
        r.customer_id,
        r.rider_id,

        r.pickup_address,
        r.pickup_latitude,
        r.pickup_longitude,

        r.dropoff_address,
        r.dropoff_latitude,
        r.dropoff_longitude,

        r.status,
        r.requested_at,
        r.accepted_at,
        r.started_at,
        r.completed_at,
        r.cancelled_at,
        r.created_at,
        r.updated_at,

        CASE
          WHEN rd.id IS NOT NULL THEN
            json_build_object(
              'id', rd.id,
              'fullName', rd.full_name,
              'phone', u.phone,
              'verificationStatus', rd.verification_status,
              'availabilityStatus', rd.availability_status
            )
          ELSE NULL
        END AS rider,

        CASE
          WHEN v.id IS NOT NULL THEN
            json_build_object(
              'id', v.id,
              'type', v.type,
              'plateNumber', v.plate_number,
              'brand', v.brand,
              'model', v.model
            )
          ELSE NULL
        END AS vehicle,

        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', h.id,
                'status', h.status,
                'changedByUserId', h.changed_by_user_id,
                'changedByRole', h.changed_by_role,
                'createdAt', h.created_at
              )
              ORDER BY h.created_at ASC
            )
            FROM ride_status_history h
            WHERE h.ride_id = r.id
          ),
          '[]'::json
        ) AS status_history

      FROM rides r

      LEFT JOIN riders rd
        ON rd.id = r.rider_id

      LEFT JOIN users u
        ON u.id = rd.user_id

      LEFT JOIN LATERAL (
        SELECT
          id,
          type,
          plate_number,
          brand,
          model
        FROM vehicles
        WHERE rider_id = rd.id
        ORDER BY created_at DESC
        LIMIT 1
      ) v ON true

      WHERE r.id = $1
        AND r.customer_id = $2

      LIMIT 1
    `,
    [rideId, customer.id]
  );

  return rideResult.rows[0] || null;
};

export const cancelCustomerRide = async (userId, rideId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const customerResult = await client.query(
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
      await client.query("ROLLBACK");
      return null;
    }

    const rideResult = await client.query(
      `
        UPDATE rides
        SET
          status = 'cancelled',
          cancelled_at = NOW(),
          updated_at = NOW()
        WHERE id = $1
          AND customer_id = $2
          AND status IN ('requested', 'accepted')
        RETURNING
          ${RIDE_COLUMNS}
      `,
      [rideId, customer.id]
    );

    const ride = rideResult.rows[0];

    if (!ride) {
      await client.query("ROLLBACK");
      return null;
    }

    await client.query(
      `
        INSERT INTO ride_status_history (
          ride_id,
          status,
          changed_by_user_id,
          changed_by_role
        )
        VALUES ($1, 'cancelled', $2, 'customer')
      `,
      [ride.id, userId]
    );

    if (ride.rider_id) {
      await client.query(
        `
          UPDATE riders
          SET
            availability_status = 'online',
            updated_at = NOW()
          WHERE id = $1
        `,
        [ride.rider_id]
      );
    }

    await client.query("COMMIT");

    return ride;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

