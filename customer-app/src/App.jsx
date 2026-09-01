import { useEffect, useState } from "react";

import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import RequestRide from "./pages/RequestRide.jsx";
import MyRides from "./pages/MyRides.jsx";

import { getMe } from "./services/auth.service.js";
import {
  getAccessToken,
  clearAuth,
} from "./utils/storage.js";

function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [createdRide, setCreatedRide] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      const token = getAccessToken();

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const result = await getMe(token);
        setUser(result.user);
      } catch (error) {
        console.error("Session check failed:", error);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setPage("dashboard");
  };

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    setPage("dashboard");
    setCreatedRide(null);
  };

  const handleRideCreated = (ride) => {
    setCreatedRide(ride);
    setPage("dashboard");
  };

  const handleViewRide = (rideId) => {
    console.log("View ride:", rideId);
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  if (page === "request-ride") {
    return (
      <RequestRide
        onBack={() => setPage("dashboard")}
        onRideCreated={handleRideCreated}
      />
    );
  }

  if (page === "my-rides") {
    return (
      <MyRides
        onBack={() => setPage("dashboard")}
        onViewRide={handleViewRide}
      />
    );
  }

  return (
    <Dashboard
      user={user}
      onLogout={handleLogout}
      onRequestRide={() => setPage("request-ride")}
      onMyRides={() => setPage("my-rides")}
      createdRide={createdRide}
    />
  );
}

export default App;
