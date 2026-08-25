import crypto from "node:crypto";
import { SignJWT, jwtVerify } from "jose";

if (!process.env.ACCESS_TOKEN_SECRET) {
  throw new Error("ACCESS_TOKEN_SECRET is not configured");
}

const secret = new TextEncoder().encode(
  process.env.ACCESS_TOKEN_SECRET
);

export const createAccessToken = async (user) => {
  return new SignJWT({
    role: user.role,
    status: user.status,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(
      process.env.ACCESS_TOKEN_EXPIRES_IN || "15m"
    )
    .sign(secret);
};

export const verifyAccessToken = async (token) => {
  const { payload } = await jwtVerify(token, secret);

  return payload;
};

export const createRefreshToken = () => {
  return crypto.randomBytes(48).toString("base64url");
};

export const hashRefreshToken = (token) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};
