import { clearAuth } from "../utils/storage.js";

function Dashboard({ user, onLogout }) {
  const handleLogout = () => {
    clearAuth();
    onLogout();
  };

  return (
    <main
      style={{
        minHeight: "100dvh",
        padding: "30px",
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "40px",
        }}
      >
        <div>
          <h1>Ride Platform</h1>
          <p>Customer Dashboard</p>
        </div>

        <button onClick={handleLogout}>
          Logout
        </button>
      </header>

      <section>
        <h2>
          Welcome{user?.email ? `, ${user.email}` : ""}!
        </h2>

        <p>
          You are successfully signed in.
        </p>

        <div
          style={{
            marginTop: "30px",
            padding: "30px",
            border: "1px solid #e5e5e5",
            borderRadius: "16px",
          }}
        >
          <h3>Ready for a ride?</h3>

          <p>
            Request a ride and find a rider near you.
          </p>

          <button>
            Request a Ride
          </button>
        </div>
      </section>
    </main>
  );
}

export default Dashboard;
