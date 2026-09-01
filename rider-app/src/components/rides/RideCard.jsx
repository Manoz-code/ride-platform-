function RideCard({
  ride,
  onAccept,
  loading,
}) {
  return (
    <div className="ride-card">
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
        onClick={() => onAccept(ride.id)}
        disabled={loading}
      >
        {loading ? "Processing..." : "Accept Ride"}
      </button>
    </div>
  );
}

export default RideCard;
