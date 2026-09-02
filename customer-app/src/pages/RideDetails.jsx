import { useEffect, useState } from "react";

import RideStatus from "../components/rides/RideStatus.jsx";
import {
  getRideById,
  cancelRide,
} from "../services/ride.service.js";
import { getAccessToken } from "../utils/storage.js";

import "../styles/ride-details.css";

function RideDetails({ rideId, onBack }) {
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const loadRide = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getAccessToken();

      if (!token) {
        setError("Your session has expired. Please sign in again.");
        return;
      }

      const result = await getRideById(token, rideId);

      setRide(result.ride);
    } catch (requestError) {
      console.error("Failed to load ride:", requestError);

      setError(
        requestError.message ||
          "Unable to load ride details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (rideId) {
      loadRide();
    }
  }, [rideId]);

  const handleCancel = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this ride?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancelling(true);
      setError("");

      const token = getAccessToken();

      if (!token) {
        setError(
          "Your session has expired. Please sign in again."
        );
        return;
      }

      const result = await cancelRide(token, rideId);

      setRide(result.ride);
    } catch (requestError) {
      console.error("Failed to cancel ride:", requestError);

      setError(
        requestError.message ||
          "Unable to cancel the ride."
      );
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (loading) {
    return (
      <main className="ride-details-page">
        <section className="ride-details-state">
          <div className="loading-spinner" />
          <h2>Loading ride...</h2>
          <p>Please wait a moment.</p>
        </section>
      </main>
    );
  }

  if (error && !ride) {
    return (
      <main className="ride-details-page">
        <div className="ride-details-container">
          <button
            type="button"
            className="ride-details-back"
            onClick={onBack}
          >
            ← My Rides
          </button>

          <section className="ride-details-state">
            <div className="ride-details-error-icon">
              !
            </div>

            <h2>Unable to load ride</h2>
            <p>{error}</p>

            <button
              type="button"
              className="ride-details-primary-button"
              onClick={loadRide}
            >
              Try Again
            </button>
          </section>
        </div>
      </main>
    );
  }

  const canCancel =
    ride?.status === "requested" ||
    ride?.status === "accepted";

  return (
    <main className="ride-details-page">
      <div className="ride-details-container">
        <header className="ride-details-header">
          <button
            type="button"
            className="ride-details-back"
            onClick={onBack}
          >
            ← My Rides
          </button>

          <button
            type="button"
            className="ride-details-refresh"
            onClick={loadRide}
            disabled={loading}
          >
            Refresh
          </button>
        </header>

        {error && (
          <div className="ride-details-error">
            {error}
          </div>
        )}

        <section className="ride-details-card">
          <div className="ride-details-title">
            <div>
              <span>Ride Details</span>
              <h1>Your ride</h1>
            </div>

            <RideStatus status={ride.status} />
          </div>

          <div className="ride-details-route">
            <div className="details-route-item">
              <div className="details-route-marker pickup-marker">
                A
              </div>

              <div>
                <small>Pickup</small>
                <p>{ride.pickup_address}</p>
              </div>
            </div>

            <div className="details-route-line" />

            <div className="details-route-item">
              <div className="details-route-marker destination-marker">
                B
              </div>

              <div>
                <small>Destination</small>
                <p>{ride.dropoff_address}</p>
              </div>
            </div>
          </div>

          <div className="ride-meta-grid">
            <div>
              <small>Requested</small>
              <strong>
                {formatDate(ride.requested_at)}
              </strong>
            </div>

            <div>
              <small>Accepted</small>
              <strong>
                {formatDate(ride.accepted_at)}
              </strong>
            </div>

            <div>
              <small>Started</small>
              <strong>
                {formatDate(ride.started_at)}
              </strong>
            </div>

            <div>
              <small>Completed</small>
              <strong>
                {formatDate(ride.completed_at)}
              </strong>
            </div>
          </div>
        </section>

        {ride.rider && (
          <section className="ride-details-card">
            <div className="section-heading">
              <span className="section-icon">👤</span>

              <div>
                <h2>Your Rider</h2>
                <p>Rider assigned to this trip</p>
              </div>
            </div>

            <div className="rider-profile">
              <div className="rider-avatar">
                {ride.rider.fullName?.charAt(0)?.toUpperCase() ||
                  "R"}
              </div>

              <div className="rider-info">
                <h3>{ride.rider.fullName}</h3>

                <p>
                  {ride.rider.phone || "Phone unavailable"}
                </p>

                <span>
                  {ride.rider.verificationStatus ===
                  "approved"
                    ? "Verified rider"
                    : "Verification pending"}
                </span>
              </div>
            </div>
          </section>
        )}

        {ride.vehicle && (
          <section className="ride-details-card">
            <div className="section-heading">
              <span className="section-icon">🚗</span>

              <div>
                <h2>Vehicle</h2>
                <p>Your assigned vehicle</p>
              </div>
            </div>

            <div className="vehicle-grid">
              <div>
                <small>Type</small>
                <strong>{ride.vehicle.type}</strong>
              </div>

              <div>
                <small>Plate Number</small>
                <strong>
                  {ride.vehicle.plateNumber}
                </strong>
              </div>

              <div>
                <small>Brand</small>
                <strong>
                  {ride.vehicle.brand || "—"}
                </strong>
              </div>

              <div>
                <small>Model</small>
                <strong>
                  {ride.vehicle.model || "—"}
                </strong>
              </div>
            </div>
          </section>
        )}

        <section className="ride-details-card">
          <div className="section-heading">
            <span className="section-icon">📋</span>

            <div>
              <h2>Status History</h2>
              <p>Updates for this ride</p>
            </div>
          </div>

          {ride.status_history?.length > 0 ? (
            <div className="status-history">
              {ride.status_history.map((history, index) => (
                <div
                  className="history-item"
                  key={history.id}
                >
                  <div className="history-marker">
                    {index + 1}
                  </div>

                  <div className="history-content">
                    <RideStatus status={history.status} />

                    <small>
                      {formatDate(history.createdAt)}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-history">
              No status updates available.
            </p>
          )}
        </section>

        {canCancel && (
          <button
            type="button"
            className="ride-details-cancel"
            onClick={handleCancel}
            disabled={cancelling}
          >
            {cancelling
              ? "Cancelling ride..."
              : "Cancel Ride"}
          </button>
        )}
      </div>
    </main>
  );
}

export default RideDetails;
