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
