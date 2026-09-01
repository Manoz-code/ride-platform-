function AvailabilityButton({
  online,
  loading,
  onToggle,
}) {
  return (
    <button
      className={`status-button ${online ? "online" : "offline"}`}
      onClick={onToggle}
      disabled={loading}
    >
      <span className="status-dot"></span>

      {online ? "Online" : "Offline"}
    </button>
  );
}

export default AvailabilityButton;
