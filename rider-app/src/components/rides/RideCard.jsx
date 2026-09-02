function RideCard({
  ride,
  onAccept,
  loading,
  isNew,
}) {
  const formatTimeAgo = (date) => {
    if (!date) return "";

    const time = new Date(date).getTime();

    if (Number.isNaN(time)) return "";

    const seconds = Math.floor(
      (Date.now() - time) / 1000
    );

    if (seconds < 10) {
      return "Just now";
    }

    if (seconds < 60) {
      return `${seconds}s ago`;
    }

    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    const hours = Math.floor(minutes / 60);

    return `${hours}h ago`;
  };

  const requestedAt =
    ride.requested_at || ride.created_at;

  return (
    <article
      className={`ride-card ${
        isNew ? "ride-card-new" : ""
      }`}
    >
      {/* Header */}
      <div className="ride-request-header">
        <div className="ride-request-type">
          <div className="ride-service-icon">
            🛵
          </div>

          <div>
            <span className="ride-service">
              {ride.service_type || "Bike"}
            </span>

            <span className="ride-request-time">
              {formatTimeAgo(requestedAt)}
            </span>
          </div>
        </div>

        {isNew && (
          <span className="new-ride-badge">
            NEW
          </span>
        )}
      </div>

      {/* Route */}
      <div className="ride-route">
        <div className="route-row">
          <span className="route-marker pickup">
            A
          </span>

          <div className="route-content">
            <span className="route-label">
              PICKUP
            </span>

            <strong>
              {ride.pickup_address}
            </strong>
          </div>
        </div>

        <div className="route-connector">
          <span />
        </div>

        <div className="route-row">
          <span className="route-marker destination">
            B
          </span>

          <div className="route-content">
            <span className="route-label">
              DESTINATION
            </span>

            <strong>
              {ride.dropoff_address}
            </strong>
          </div>
        </div>
      </div>

      {/* Coordinates / ride information */}
      <div className="ride-meta">
        <div className="ride-meta-item">
          <span>Service</span>
          <strong>
            {ride.service_type || "Bike"}
          </strong>
        </div>

        <div className="ride-meta-item">
          <span>Status</span>
          <strong>
            {ride.status || "Requested"}
          </strong>
        </div>
      </div>

      {/* Accept */}
      <button
        type="button"
        className="accept-button"
        onClick={() => onAccept(ride.id)}
        disabled={loading}
      >
        {loading ? (
          "Accepting..."
        ) : (
          <>
            Accept Ride
            <span className="accept-arrow">
              →
            </span>
          </>
        )}
      </button>
    </article>
  );
}

export default RideCard;
