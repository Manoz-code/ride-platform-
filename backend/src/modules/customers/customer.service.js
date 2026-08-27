import { query } from "../../config/database.js";

export const getCustomerByUserId = async (userId) => {
  const result = await query(
    `
      SELECT
        id,
        user_id,
        full_name,
        created_at,
        updated_at
      FROM customers
      WHERE user_id = $1
      LIMIT 1
    `,
    [userId]
  );

  return result.rows[0] || null;
};


export const updateCustomerByUserId = async (userId, fullName) => {
  const result = await query(
    `
      UPDATE customers
      SET
        full_name = $1,
        updated_at = NOW()
      WHERE user_id = $2
      RETURNING
        id,
        user_id,
        full_name,
        created_at,
        updated_at
    `,
    [fullName, userId]
  );

  return result.rows[0] || null;
};