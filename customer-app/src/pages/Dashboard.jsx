import { clearAuth } from "../utils/storage.js";
import "../styles/dashboard.css";

function Dashboard({
  user,
  onLogout,
  onRequestRide,
  onMyRides,
  createdRide,
}) {
  const handleLogout = () => {
    clearAuth();
    onLogout();
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

        {createdRide && (
          <div className="ride-created-message">
            <div>
              <strong>Ride requested successfully!</strong>
              <p>
                Your ride is now waiting for a nearby rider.
              </p>
            </div>

            <button
              type="button"
              onClick={onMyRides}
            >
              View My Rides
            </button>
          </div>
        )}

        <section className="request-card">
          <div className="request-icon">📍</div>

          <div className="request-content">
            <h3>Ready for a ride?</h3>

            <p>
              Request a ride and find a nearby rider quickly.
            </p>

            <button
              type="button"
              className="request-button"
              onClick={onRequestRide}
            >
              Request a Ride
            </button>
          </div>
        </section>

        <section className="dashboard-grid">
          <button
            type="button"
            className="dashboard-card dashboard-card-button"
            onClick={onRequestRide}
          >
            <span className="card-icon">🚗</span>

            <h3>Book a Ride</h3>

            <p>
              Choose your pickup and destination.
            </p>
          </button>

          <button
            type="button"
            className="dashboard-card dashboard-card-button"
            onClick={onMyRides}
          >
            <span className="card-icon">📋</span>

            <h3>My Rides</h3>

            <p>
              View your previous and active rides.
            </p>
          </button>

          <button
            type="button"
            className="dashboard-card dashboard-card-button"
          >
            <span className="card-icon">👤</span>

            <h3>Profile</h3>

            <p>
              Manage your account information.
            </p>
          </button>
        </section>
      </section>
    </main>
  );
}

export default Dashboard;
