import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";

import {
  login,
  loginWithGoogle,
} from "../services/auth.service.js";

import {
  setAccessToken,
  setRefreshToken,
} from "../utils/storage.js";

import "../styles/login.css";

function Login({ onLogin }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const result = await login(phone, password);

      setAccessToken(result.accessToken);
      setRefreshToken(result.refreshToken);

      console.log("Login successful:", result.user);

      onLogin(result.user);
    } catch (error) {
      console.error("Login failed:", error);
      setError(error.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError("");

    try {
      const idToken = credentialResponse.credential;

      const result = await loginWithGoogle(idToken);

      setAccessToken(result.accessToken);
      setRefreshToken(result.refreshToken);

      console.log("Google login successful:", result.user);

      onLogin(result.user);
    } catch (error) {
      console.error("Google login failed:", error);
      setError(error.message || "Google login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google sign-in was cancelled or failed.");
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-header">
          <div className="brand-icon">R</div>

          <div>
            <p className="brand-name">Ride Platform</p>
            <span className="brand-subtitle">Customer</span>
          </div>
        </div>

        <div className="login-heading">
          <h1>Welcome back</h1>
          <p>Sign in to book and manage your rides.</p>
        </div>

        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        <form
          onSubmit={handleLogin}
          className="login-form"
        >
          <label htmlFor="phone">
            Phone number
          </label>

          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(event) =>
              setPhone(event.target.value)
            }
            placeholder="+977 98XXXXXXXX"
            autoComplete="tel"
            required
          />

          <label htmlFor="password">
            Password
          </label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Sign in"}
          </button>
        </form>

        <div className="divider">
          <span>or</span>
        </div>

        <div className="google-login">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            width="350"
          />
        </div>

        <p className="signup-text">
          Don't have an account?{" "}
          <button
            type="button"
            className="signup-link"
          >
            Create account
          </button>
        </p>
      </section>
    </main>
  );
}

export default Login;