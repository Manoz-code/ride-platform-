import { useCallback, useEffect, useState } from "react";
import "./App.css";

import LoginCard from "./components/auth/LoginCard.jsx";
import Message from "./components/common/Message.jsx";
import Stats from "./components/dashboard/Stats.jsx";
import WelcomeCard from "./components/dashboard/WelcomeCard.jsx";
import Header from "./components/layout/Header.jsx";
import ActiveRide from "./components/rides/ActiveRide.jsx";
import RideRequests from "./components/rides/RideRequests.jsx";

import { useAuth } from "./hooks/useAuth.js";
import { useRideSocket } from "./hooks/useRideSocket.js";

import {
  getActiveRide,
  acceptRide,
  startRide,
  completeRide,
  cancelRide,
} from "./services/ride.service.js";

import {
  updateAvailability,
  getAvailableRides,
} from "./services/rider.service.js";

function App() {
  const { token, login, loading: authLoading } = useAuth();

  const [online, setOnline] = useState(false);
  const [rides, setRides] = useState([]);
  const [activeRide, setActiveRide] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // =========================
  // LOAD ACTIVE RIDE
  // =========================

  const loadActiveRide = useCallback(async () => {
    if (!token) return;

    try {
      const data = await getActiveRide(token);

      setActiveRide(data?.ride || null);
    } catch (error) {
      console.error("Failed to load active ride:", error);
    }
  }, [token]);

  // =========================
  // LOAD AVAILABLE RIDES
  // =========================

  const loadAvailableRides = useCallback(async () => {
    if (!token) return;

    try {
      const data = await getAvailableRides(token);

      setRides(data.rides || []);
    } catch (error) {
      setMessage(error.message);
    }
  }, [token]);

  // =========================
  // LOAD RIDER STATE
  // =========================

  useEffect(() => {
    if (!token) return;

    loadActiveRide();
  }, [token, loadActiveRide]);

  // =========================
  // SOCKET: RIDE REQUESTED
  // =========================

  const handleRideRequested = useCallback((payload) => {
    if (!payload?.ride) return;

    setRides((currentRides) => {
      const exists = currentRides.some(
        (ride) => ride.id === payload.ride.id
      );

      if (exists) {
        return currentRides;
      }

      return [...currentRides, payload.ride];
    });
  }, []);

  // =========================
  // SOCKET: RIDE ACCEPTED
  // =========================

  const handleRideAccepted = useCallback((payload) => {
    if (!payload?.ride) return;

    setRides((currentRides) =>
      currentRides.filter(
        (ride) => ride.id !== payload.ride.id
      )
    );
  }, []);

  const { connected } = useRideSocket({
    token,
    onRideRequested: handleRideRequested,
    onRideAccepted: handleRideAccepted,
  });

  // =========================
  // LOGIN
  // =========================

  const handleLogin = async () => {
    try {
      setMessage("");

      await login();

      setMessage("Logged in successfully.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  // =========================
  // CHANGE AVAILABILITY
  // =========================

  const changeAvailability = async () => {
    console.log("CHANGE AVAILABILITY CLICKED", {
      tokenExists: Boolean(token),
      online,
      loading,
    });

    if (!token) return;

    const nextStatus = online ? "offline" : "online";

    try {
      setLoading(true);
      setMessage("");

      await updateAvailability(token, nextStatus);

      setOnline(nextStatus === "online");

      if (nextStatus === "online") {
        await loadActiveRide();
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

  // =========================
  // ACCEPT RIDE
  // =========================

  const handleAcceptRide = async (rideId) => {
    try {
      setLoading(true);
      setMessage("");

      const data = await acceptRide(token, rideId);

      setRides((currentRides) =>
        currentRides.filter(
          (ride) => ride.id !== rideId
        )
      );

      setActiveRide(data.ride);

      setMessage("Ride accepted successfully.");
    } catch (error) {
      setMessage(error.message);

      // If the backend says the rider already has
      // an active ride, load that ride into the UI.
      if (error?.status === 409) {
        await loadActiveRide();
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // START RIDE
  // =========================

  const handleStartRide = async (rideId) => {
    try {
      setLoading(true);
      setMessage("");

      const data = await startRide(token, rideId);

      setActiveRide(data.ride);

      setMessage("Ride started successfully.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // COMPLETE RIDE
  // =========================

  const handleCompleteRide = async (rideId) => {
    try {
      setLoading(true);
      setMessage("");

      const data = await completeRide(token, rideId);

      setActiveRide(null);

      setMessage("Ride completed successfully.");

      if (data?.ride) {
        setRides((currentRides) =>
          currentRides.filter(
            (ride) => ride.id !== data.ride.id
          )
        );
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // CANCEL RIDE
  // =========================

  const handleCancelRide = async (rideId) => {
    try {
      setLoading(true);
      setMessage("");

      await cancelRide(token, rideId);

      setActiveRide(null);

      setMessage("Ride cancelled successfully.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOGIN SCREEN
  // =========================

  if (!token) {
    return (
      <div className="app">
        <main className="dashboard">
          <LoginCard
            loading={authLoading}
            onLogin={handleLogin}
          />

          {message && <Message message={message} />}
        </main>
      </div>
    );
  }

  // =========================
  // RIDER DASHBOARD
  // =========================

  return (
    <div className="app">
      <Header
        connected={connected}
        online={online}
        loading={loading}
        onToggleAvailability={changeAvailability}
      />

      <main className="dashboard">
        <WelcomeCard online={online} />

        <Stats />

        {message && <Message message={message} />}

        <ActiveRide
          ride={activeRide}
          loading={loading}
          onStart={handleStartRide}
          onComplete={handleCompleteRide}
          onCancel={handleCancelRide}
        />

        <RideRequests
          rides={rides}
          online={online}
          loading={loading}
          onAccept={handleAcceptRide}
        />
      </main>
    </div>
  );
}

export default App;