import crypto from "node:crypto";
import pool from "../../config/database.js";
import {
  createAccessToken,
  createRefreshToken,
  hashRefreshToken,
} from "../../utils/tokens.js";

const refreshTokenDays = Number(
  process.env.REFRESH_TOKEN_DAYS || 30
);

export const createSession = async ({
  user,
  userAgent,
  ipAddress,
}) => {
  const refreshToken = createRefreshToken();
  const refreshTokenHash = hashRefreshToken(refreshToken);

  const expiresAt = new Date(
    Date.now() +
      refreshTokenDays * 24 * 60 * 60 * 1000
  );

  const sessionId = crypto.randomUUID();

  await pool.query(
    `
      INSERT INTO auth_sessions (
        id,
        user_id,
        refresh_token_hash,
        user_agent,
        ip_address,
        expires_at,
        last_used_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `,
    [
      sessionId,
      user.id,
      refreshTokenHash,
      userAgent || null,
      ipAddress || null,
      expiresAt,
    ]
  );

  const accessToken = await createAccessToken(user);

  return {
    accessToken,
    refreshToken,
    expiresAt,
  };
};
