import RideList from "./RideList.jsx";

function RideRequests({
  rides,
  online,
  loading,
  onAccept,
}) {
  return (
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
        <RideList
          rides={rides}
          onAccept={onAccept}
          loading={loading}
        />
      )}
    </section>
  );
}

export default RideRequests;
