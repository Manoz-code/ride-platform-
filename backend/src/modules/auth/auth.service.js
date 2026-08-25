import pool from "../../config/database.js";
import { hashPassword, verifyPassword } from "../../utils/password.js";
import { createSession } from "./session.service.js";

export const registerUser = async ({
  phone,
  password,
  fullName,
  role,
}) => {
  const passwordHash = await hashPassword(password);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const userResult = await client.query(
      `
        INSERT INTO users (
          phone,
          password_hash,
          role
        )
        VALUES ($1, $2, $3)
        RETURNING id, phone, role, status, created_at
      `,
      [phone, passwordHash, role]
    );

    const user = userResult.rows[0];

    if (role === "customer") {
      await client.query(
        `
          INSERT INTO customers (
            user_id,
            full_name
          )
          VALUES ($1, $2)
        `,
        [user.id, fullName]
      );
    }

    if (role === "rider") {
      await client.query(
        `
          INSERT INTO riders (
            user_id,
            full_name
          )
          VALUES ($1, $2)
        `,
        [user.id, fullName]
      );
    }

    await client.query("COMMIT");

    return user;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const loginUser = async ({
  phone,
  password,
  userAgent,
  ipAddress,
}) => {
  const result = await pool.query(
    `
      SELECT
        id,
        phone,
        password_hash,
        role,
        status
      FROM users
      WHERE phone = $1
      LIMIT 1
    `,
    [phone]
  );

  const user = result.rows[0];

  if (!user) {
    return null;
  }

  const passwordValid = await verifyPassword(
    user.password_hash,
    password
  );

  if (!passwordValid) {
    return null;
  }

  if (user.status !== "active") {
    return null;
  }

  const safeUser = {
    id: user.id,
    phone: user.phone,
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
};
