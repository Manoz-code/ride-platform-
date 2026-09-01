import RideMap from "./RideMap.jsx";
import "./ActiveRide.css";



function ActiveRide({
  ride,
  loading,
  onStart,
  onComplete,
  onCancel,
}) {
  if (!ride) {
    return null;
  }

  const isAccepted = ride.status === "accepted";
  const isInProgress = ride.status === "in_progress";

  const statusLabel =
    ride.status === "in_progress"
      ? "Ride in progress"
      : "Waiting to start";

  return (
    <section className="rides-section active-ride-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">CURRENT RIDE</p>
          <h2>Active Ride</h2>
        </div>

        <span className={`ride-status ${ride.status}`}>
          {statusLabel}
        </span>
      </div>

      <div className="ride-card active-ride">
        {/* Map */}
        <RideMap
          pickupLatitude={ride.pickup_latitude}
          pickupLongitude={ride.pickup_longitude}
          dropoffLatitude={ride.dropoff_latitude}
          dropoffLongitude={ride.dropoff_longitude}
        />

        {/* Ride information */}
        <div className="active-ride-info">
          <div className="ride-top">
            <span className="ride-service">
              🛵 {ride.service_type}
            </span>
          </div>

          <div className="route">
            <div className="route-item">
              <span className="route-dot pickup-dot" />
              <div>
                <small>Pickup</small>
                <strong>{ride.pickup_address}</strong>
              </div>
            </div>

            <div className="route-line" />

            <div className="route-item">
              <span className="route-dot dropoff-dot" />
              <div>
                <small>Dropoff</small>
                <strong>{ride.dropoff_address}</strong>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="active-ride-actions">
            {isAccepted && (
              <button
                className="primary-ride-button"
                onClick={() => onStart(ride.id)}
                disabled={loading}
              >
                {loading ? "Starting..." : "Start Ride"}
              </button>
            )}

            {isInProgress && (
              <button
                className="primary-ride-button"
                onClick={() => onComplete(ride.id)}
                disabled={loading}
              >
                {loading ? "Completing..." : "Complete Ride"}
              </button>
            )}

            {(isAccepted || isInProgress) && (
              <button
                className="cancel-button"
                onClick={() => onCancel(ride.id)}
                disabled={loading}
              >
                Cancel Ride
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ActiveRide;