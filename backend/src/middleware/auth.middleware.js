import { verifyAccessToken } from "../utils/tokens.js";

export const requireAuth = async (req, res, next) => {
  try {
    const authorization = req.get("authorization");

    if (!authorization) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization header.",
      });
    }

    const payload = await verifyAccessToken(token);

    req.user = {
      id: payload.sub,
      role: payload.role,
      status: payload.status,
    };

    next();
  } catch (error) {
    console.error("AUTH TOKEN ERROR:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired access token.",
    });
  }
};
