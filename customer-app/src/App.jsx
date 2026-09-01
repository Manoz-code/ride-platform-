import "./styles/app.css";

function App() {
  return (
    <div className="app">
      <main className="app-container">
        <section className="welcome-card">
          <span className="welcome-badge">Ride Platform</span>

          <h1>Book your ride</h1>

          <p>
            Fast, simple and reliable rides whenever you need them.
          </p>

          <button className="primary-button">
            Request a Ride
          </button>
        </section>
      </main>
    </div>
  );
}

export default App;