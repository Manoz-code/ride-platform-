import { OAuth2Client } from "google-auth-library";

const googleClientId = process.env.GOOGLE_CLIENT_ID;

if (!googleClientId) {
  throw new Error("GOOGLE_CLIENT_ID is not configured.");
}

const googleClient = new OAuth2Client(googleClientId);

export const verifyGoogleIdToken = async (idToken) => {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: googleClientId,
  });

  const payload = ticket.getPayload();

  if (!payload) {
    throw new Error("Invalid Google token.");
  }

  if (!payload.sub) {
    throw new Error("Google account ID is missing.");
  }

  if (!payload.email) {
    throw new Error("Google account email is missing.");
  }

  if (payload.email_verified !== true) {
    throw new Error("Google email is not verified.");
  }

  return {
    googleId: payload.sub,
    email: payload.email,
    fullName: payload.name || "Google User",
    picture: payload.picture || null,
  };
};