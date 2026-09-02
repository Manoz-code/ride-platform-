import RideCard from "./RideCard.jsx";

function RideRequests({
  rides,
  online,
  loading,
  onAccept,
}) {
  const sortedRides = [...rides].sort((a, b) => {
    const timeA = new Date(
      a.requested_at || a.created_at || 0
    ).getTime();

    const timeB = new Date(
      b.requested_at || b.created_at || 0
    ).getTime();

    return timeB - timeA;
  });

  return (
    <section className="rides-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">RIDE REQUESTS</p>
          <h2>Available Rides</h2>
        </div>

        <span className="ride-count">
          {sortedRides.length}
        </span>
      </div>

      {!online ? (
        <div className="empty-state">
          <div className="empty-icon">🛵</div>

          <h3>You're offline</h3>

          <p>
            Go online to start receiving nearby ride requests.
          </p>
        </div>
      ) : sortedRides.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📍</div>

          <h3>Waiting for rides</h3>

          <p>
            New ride requests will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="ride-list">
          {sortedRides.map((ride, index) => (
            <RideCard
              key={ride.id}
              ride={ride}
              isNew={index === 0}
              onAccept={onAccept}
              loading={loading}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default RideRequests;
