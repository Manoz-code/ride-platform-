import RideCard from "./RideCard.jsx";

function RideList({
  rides,
  onAccept,
  loading,
}) {
  return (
    <div className="ride-list">
      {rides.map((ride) => (
        <RideCard
          key={ride.id}
          ride={ride}
          onAccept={onAccept}
          loading={loading}
        />
      ))}
    </div>
  );
}

export default RideList;
