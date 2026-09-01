import RideStatus from "./RideStatus.jsx";

function RideCard({ ride, onView, onCancel, cancelling }) {
  const canCancel =
    ride.status === "requested" ||
    ride.status === "accepted";

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <article className="ride-card">
      <div className="ride-card-top">
        <div>
          <span className="ride-card-label">Ride</span>
          <h3>{ride.pickup_address}</h3>
        </div>

        <RideStatus status={ride.status} />
      </div>

      <div className="ride-route">
        <div className="ride-route-point pickup-point">
          <span>A</span>
        </div>

        <div className="ride-route-line" />

        <div className="ride-route-point destination-point">
          <span>B</span>
        </div>

        <div className="ride-route-addresses">
          <div>
            <small>Pickup</small>
            <p>{ride.pickup_address}</p>
          </div>

          <div>
            <small>Destination</small>
            <p>{ride.dropoff_address}</p>
          </div>
        </div>
      </div>

      <div className="ride-card-footer">
        <div>
          <small>Requested</small>
          <strong>{formatDate(ride.requested_at)}</strong>
        </div>

        <div className="ride-card-actions">
          <button
            type="button"
            className="ride-view-button"
            onClick={() => onView(ride.id)}
          >
            View Details
          </button>

          {canCancel && (
            <button
              type="button"
              className="ride-cancel-button"
              onClick={() => onCancel(ride.id)}
              disabled={cancelling}
            >
              {cancelling ? "Cancelling..." : "Cancel"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default RideCard;
