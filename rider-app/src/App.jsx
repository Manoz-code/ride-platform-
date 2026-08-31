import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./App.css";

const API_URL = "http://localhost:5000/api/v1";
const SOCKET_URL = "http://localhost:5000";

function App() {
  const [token, setToken] = useState("");
  const [online, setOnline] = useState(false);
  const [rides, setRides] = useState([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Temporary development login.
  // We will replace this with a proper login screen later.
  const login = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: "+9779800000098",
          password: "TestRider123",
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.accessToken) {
        throw new Error(data.message || "Login failed.");
      }

      setToken(data.accessToken);
      setMessage("Logged in successfully.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Connect to Socket.IO after login.
  useEffect(() => {
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: {
        token,
      },
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      setConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
      setConnected(false);
    });

    socket.on("ride:requested", (payload) => {
      console.log("New ride received:", payload);

      if (payload?.ride) {
        setRides((currentRides) => {
          const exists = currentRides.some(
            (ride) => ride.id === payload.ride.id
          );

          if (exists) {
            return currentRides;
          }

          return [...currentRides, payload.ride];
        });
      }
    });

    socket.on("ride:accepted", (payload) => {
      if (!payload?.ride) return;

      setRides((currentRides) =>
        currentRides.filter((ride) => ride.id !== payload.ride.id)
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  // Load rides that already exist before socket connection.
  const loadAvailableRides = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/riders/rides`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load rides.");
      }

      setRides(data.rides || []);
    } catch (error) {
      setMessage(error.message);
    }
  };

  // Change rider availability.
  const changeAvailability = async () => {
    if (!token) return;

    const nextStatus = online ? "offline" : "online";

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(`${API_URL}/riders/availability`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          availabilityStatus: nextStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update availability.");
      }

      setOnline(nextStatus === "online");

      if (nextStatus === "online") {
        await loadAvailableRides();
      } else {
        setRides([]);
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Accept a ride.
  const acceptRide = async (rideId) => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        `${API_URL}/riders/rides/${rideId}/accept`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to accept ride.");
      }

      setRides((currentRides) =>
        currentRides.filter((ride) => ride.id !== rideId)
      );

      setMessage("Ride accepted successfully.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Start a ride.
  const startRide = async (rideId) => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        `${API_URL}/riders/rides/${rideId}/start`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to start ride.");
      }

      setMessage("Ride started successfully.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Complete a ride.
  const completeRide = async (rideId) => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        `${API_URL}/riders/rides/${rideId}/complete`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to complete ride.");
      }

      setMessage("Ride completed successfully.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Rider App</h1>
          <p>Ride Platform</p>
        </div>

        <div className="header-right">
          <span className={`connection ${connected ? "connected" : ""}`}>
            {connected ? "● Connected" : "● Disconnected"}
          </span>

          <button
            className={`status-button ${online ? "online" : "offline"}`}
            onClick={changeAvailability}
            disabled={!token || loading}
          >
            <span className="status-dot"></span>
            {online ? "Online" : "Offline"}
          </button>
        </div>
      </header>

      <main className="dashboard">
        {!token ? (
          <section className="login-card">
            <p className="eyebrow">RIDER LOGIN</p>
            <h2>Welcome, Rider 👋</h2>
            <p>
              Login to connect to the ride platform and receive ride
              requests.
            </p>

            <button
              className="primary-button"
              onClick={login}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login as Test Rider"}
            </button>
          </section>
        ) : (
          <>
            <section className="welcome-card">
              <p className="eyebrow">RIDER DASHBOARD</p>

              <h2>Welcome back 👋</h2>

              <p>
                {online
                  ? "You are online and ready to receive rides."
                  : "Go online to start receiving rides."}
              </p>
            </section>

            <section className="stats">
              <div className="stat-card">
                <span>Today's rides</span>
                <strong>0</strong>
              </div>

              <div className="stat-card">
                <span>Today's earnings</span>
                <strong>Rs. 0</strong>
              </div>
            </section>

            {message && <div className="message">{message}</div>}

            <section className="rides-section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">REQUESTS</p>
                  <h2>Available Rides</h2>
                </div>

                <span className="ride-count">
                  {rides.length}
                </span>
              </div>

              {!online ? (
                <div className="empty-state">
                  <div className="empty-icon">🛵</div>
                  <h3>You're offline</h3>
                  <p>
                    Go online to receive nearby ride requests.
                  </p>
                </div>
              ) : rides.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📍</div>
                  <h3>No rides yet</h3>
                  <p>
                    New ride requests will appear here automatically.
                  </p>
                </div>
              ) : (
                <div className="ride-list">
                  {rides.map((ride) => (
                    <div className="ride-card" key={ride.id}>
                      <div className="ride-top">
                        <span className="ride-service">
                          🛵 {ride.service_type}
                        </span>

                        <span className="ride-status">
                          {ride.status}
                        </span>
                      </div>

                      <div className="location">
                        <strong>Pickup</strong>
                        <span>{ride.pickup_address}</span>
                      </div>

                      <div className="location">
                        <strong>Dropoff</strong>
                        <span>{ride.dropoff_address}</span>
                      </div>

                      <button
                        className="accept-button"
                        onClick={() => acceptRide(ride.id)}
                        disabled={loading}
                      >
                        Accept Ride
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
