import { clearAuth } from "../utils/storage.js";
import "../styles/dashboard.css";

function Dashboard({
  user,
  onLogout,
  onRequestRide,
  createdRide,
}) {
  const handleLogout = () => {
    clearAuth();
    onLogout();
  };

  const handleRequestRide = () => {
    if (typeof onRequestRide === "function") {
      onRequestRide();
    }
  };

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <div className="dashboard-brand-icon">R</div>

          <div>
            <h1>Ride Platform</h1>
            <p>Customer</p>
          </div>
        </div>

        <button
          type="button"
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>

      <section className="dashboard-content">
        <div className="dashboard-welcome">
          <span className="dashboard-badge">
            Customer Dashboard
          </span>

          <h2>
            Welcome
            {user?.email
              ? `, ${user.email.split("@")[0]}`
              : ""}
            !
          </h2>

          <p>
            Where would you like to go today?
          </p>
        </div>

        <section className="request-card">
          <div className="request-icon">📍</div>

          <div className="request-content">
            <h3>Ready for a ride?</h3>

            <p>
              Request a ride and find a nearby rider
              quickly.
            </p>

            <button
              type="button"
              className="request-button"
              onClick={handleRequestRide}
            >
              Request a Ride
            </button>
          </div>
        </section>

        {createdRide && (
          <section className="ride-created-card">
            <div className="ride-created-icon">✓</div>

            <div>
              <h3>Ride requested successfully</h3>

              <p>
                Your ride has been created and nearby
                riders have been notified.
              </p>

              <div className="ride-created-details">
                <span>
                  <strong>Status:</strong>{" "}
                  {createdRide.status}
                </span>

                <span>
                  <strong>Ride ID:</strong>{" "}
                  {createdRide.id}
                </span>
              </div>
            </div>
          </section>
        )}

        <section className="dashboard-grid">
          <div className="dashboard-card">
            <span className="card-icon">🚗</span>

            <h3>Book a Ride</h3>

            <p>
              Choose your pickup and destination.
            </p>

            <button
              type="button"
              className="card-action"
              onClick={handleRequestRide}
            >
              Book now
            </button>
          </div>

          <div className="dashboard-card">
            <span className="card-icon">📋</span>

            <h3>My Rides</h3>

            <p>
              View your previous and active rides.
            </p>

            <button
              type="button"
              className="card-action"
            >
              View rides
            </button>
          </div>

          <div className="dashboard-card">
            <span className="card-icon">👤</span>

            <h3>Profile</h3>

            <p>
              Manage your account information.
            </p>

            <button
              type="button"
              className="card-action"
            >
              View profile
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}

export default Dashboard;