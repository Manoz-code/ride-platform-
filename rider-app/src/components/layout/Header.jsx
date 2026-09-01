import AvailabilityButton from "../availability/AvailabilityButton.jsx";

function Header({
  connected,
  online,
  loading,
  onToggleAvailability,
}) {
  return (
    <header className="header">
      <div>
        <h1>Rider App</h1>
        <p>Ride Platform</p>
      </div>

      <div className="header-right">
        <span
          className={`connection ${connected ? "connected" : ""}`}
        >
          {connected ? "● Connected" : "● Disconnected"}
        </span>

        <AvailabilityButton
          online={online}
          loading={loading}
          onToggle={onToggleAvailability}
        />
      </div>
    </header>
  );
}

export default Header;
