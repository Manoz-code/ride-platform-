import { useEffect, useState } from "react";

import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";

import { getMe } from "./services/auth.service.js";
import {
  getAccessToken,
  clearAuth,
} from "./utils/storage.js";

function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const restoreSession = async () => {
      const token = getAccessToken();

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const result = await getMe(token);

        setUser(result.user);
      } catch (error) {
        console.error("Session restore failed:", error);

        clearAuth();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    clearAuth();
    setUser(null);
  };

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
        }}
      >
        <p>Loading...</p>
      </main>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Dashboard
      user={user}
      onLogout={handleLogout}
    />
  );
}

export default App;
