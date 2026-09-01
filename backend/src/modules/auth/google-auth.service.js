import pool from "../../config/database.js";
import { verifyGoogleIdToken } from "./google.service.js";
import { createSession } from "./session.service.js";

export const loginWithGoogle = async ({
  idToken,
  userAgent,
  ipAddress,
}) => {
  const googleUser = await verifyGoogleIdToken(idToken);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Check whether this Google account is already connected
    const providerResult = await client.query(
      `
        SELECT
          u.id,
          u.phone,
          u.email,
          u.role,
          u.status
        FROM user_auth_providers p
        INNER JOIN users u
          ON u.id = p.user_id
        WHERE p.provider = 'google'
          AND p.provider_user_id = $1
        LIMIT 1
      `,
      [googleUser.googleId]
    );

    let user = providerResult.rows[0];

    // 2. Existing Google user
    if (user) {
      if (user.status !== "active") {
        await client.query("ROLLBACK");
        return null;
      }
    }

    // 3. If no Google account exists, check email
    if (!user) {
      const emailResult = await client.query(
        `
          SELECT
            id,
            phone,
            email,
            role,
            status
          FROM users
          WHERE LOWER(email) = LOWER($1)
          LIMIT 1
        `,
        [googleUser.email]
      );

      user = emailResult.rows[0];
    }

    // 4. Existing email account
    if (user) {
      if (user.status !== "active") {
        await client.query("ROLLBACK");
        return null;
      }

      await client.query(
        `
          INSERT INTO user_auth_providers (
            user_id,
            provider,
            provider_user_id
          )
          VALUES ($1, 'google', $2)
          ON CONFLICT (provider, provider_user_id)
          DO NOTHING
        `,
        [user.id, googleUser.googleId]
      );
    }

    // 5. Completely new Google customer
    if (!user) {
      const userResult = await client.query(
        `
          INSERT INTO users (
            email,
            role,
            status
          )
          VALUES ($1, 'customer', 'active')
          RETURNING
            id,
            phone,
            email,
            role,
            status
        `,
        [googleUser.email]
      );

      user = userResult.rows[0];

      await client.query(
        `
          INSERT INTO customers (
            user_id,
            full_name
          )
          VALUES ($1, $2)
        `,
        [user.id, googleUser.fullName]
      );

      await client.query(
        `
          INSERT INTO user_auth_providers (
            user_id,
            provider,
            provider_user_id
          )
          VALUES ($1, 'google', $2)
        `,
        [user.id, googleUser.googleId]
      );
    }

    await client.query("COMMIT");

    const safeUser = {
      id: user.id,
      phone: user.phone,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    const session = await createSession({
      user: safeUser,
      userAgent,
      ipAddress,
    });

    return {
      user: safeUser,
      ...session,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

