import { useEffect, useState } from "react";

import RideCard from "../components/rides/RideCard.jsx";
import {
  getMyRides,
  cancelRide,
} from "../services/ride.service.js";
import { getAccessToken } from "../utils/storage.js";

import "../styles/my-rides.css";

function MyRides({ onBack, onViewRide }) {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingRideId, setCancellingRideId] = useState(null);

  const loadRides = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getAccessToken();

      if (!token) {
        setError("Your session has expired. Please sign in again.");
        return;
      }

      const result = await getMyRides(token);

      setRides(result.rides || []);
    } catch (requestError) {
      console.error("Failed to load rides:", requestError);

      setError(
        requestError.message ||
          "Unable to load your rides. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRides();
  }, []);

  const handleCancel = async (rideId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this ride?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingRideId(rideId);
      setError("");

      const token = getAccessToken();

      if (!token) {
        setError(
          "Your session has expired. Please sign in again."
        );
        return;
      }

      await cancelRide(token, rideId);

      await loadRides();
    } catch (requestError) {
      console.error("Failed to cancel ride:", requestError);

      setError(
        requestError.message ||
          "Unable to cancel the ride. Please try again."
      );
    } finally {
      setCancellingRideId(null);
    }
  };

  return (
    <main className="my-rides-page">
      <div className="my-rides-container">
        <header className="my-rides-header">
          <button
            type="button"
            className="my-rides-back-button"
            onClick={onBack}
          >
            ← Dashboard
          </button>

          <div className="my-rides-heading">
            <span className="my-rides-badge">
              Customer
            </span>

            <h1>My Rides</h1>

            <p>
              View and manage your current and previous rides.
            </p>
          </div>

          <button
            type="button"
            className="my-rides-refresh-button"
            onClick={loadRides}
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </header>

        {error && (
          <div className="my-rides-error">
            {error}
          </div>
        )}

        {loading ? (
          <section className="my-rides-state">
            <div className="loading-spinner" />
            <h2>Loading your rides...</h2>
            <p>Please wait a moment.</p>
          </section>
        ) : rides.length === 0 ? (
          <section className="my-rides-state">
            <div className="empty-rides-icon">
              🚗
            </div>

            <h2>No rides yet</h2>

            <p>
              Your requested rides will appear here.
            </p>

            <button
              type="button"
              className="empty-rides-button"
              onClick={onBack}
            >
              Request a Ride
            </button>
          </section>
        ) : (
          <section className="rides-list">
            <div className="rides-list-header">
              <h2>Your rides</h2>

              <span>
                {rides.length}{" "}
                {rides.length === 1 ? "ride" : "rides"}
              </span>
            </div>

            {rides.map((ride) => (
              <RideCard
                key={ride.id}
                ride={ride}
                onView={onViewRide}
                onCancel={handleCancel}
                cancelling={cancellingRideId === ride.id}
              />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

export default MyRides;
