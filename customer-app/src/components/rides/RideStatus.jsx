function RideStatus({ status }) {
  const statusConfig = {
    requested: {
      label: "Requested",
      className: "status-requested",
    },
    accepted: {
      label: "Accepted",
      className: "status-accepted",
    },
    in_progress: {
      label: "In Progress",
      className: "status-progress",
    },
    completed: {
      label: "Completed",
      className: "status-completed",
    },
    cancelled: {
      label: "Cancelled",
      className: "status-cancelled",
    },
  };

  const config =
    statusConfig[status] || {
      label: status || "Unknown",
      className: "status-unknown",
    };

  return (
    <span className={`ride-status ${config.className}`}>
      <span className="ride-status-dot" />
      {config.label}
    </span>
  );
}

export default RideStatus;
