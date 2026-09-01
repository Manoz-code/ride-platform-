import {
  registerSchema,
  loginSchema,
} from "./auth.validation.js";

import {
  registerUser,
  loginUser,
} from "./auth.service.js";

import {
  googleLoginSchema,
} from "./google.validation.js";

import {
  loginWithGoogle,
} from "./google-auth.service.js";
export const register = async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    const user = await registerUser(data);

    res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);

    const result = await loginUser({
      ...data,
      userAgent: req.get("user-agent"),
      ipAddress: req.ip,
    });

    if (!result) {
      return res.status(401).json({
        success: false,
        message: "Invalid phone number or password.",
      });
    }

    res.status(200).json({
      success: true,
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      refreshTokenExpiresAt: result.expiresAt,
    });
  } catch (error) {
    next(error);
  }
};
export const me = (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

export const googleLogin = async (req, res, next) => {
  try {
    const data = googleLoginSchema.parse(req.body);

    const result = await loginWithGoogle({
      idToken: data.idToken,
      userAgent: req.get("user-agent"),
      ipAddress: req.ip,
    });

    if (!result) {
      return res.status(401).json({
        success: false,
        message: "Google account is not allowed to sign in.",
      });
    }

    res.status(200).json({
      success: true,
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      refreshTokenExpiresAt: result.expiresAt,
    });
  } catch (error) {
    next(error);
  }
};