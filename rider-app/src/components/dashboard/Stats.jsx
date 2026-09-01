function Stats({
  ridesToday = 0,
  earningsToday = 0,
}) {
  return (
    <section className="stats">
      <div className="stat-card">
        <span>Today's rides</span>
        <strong>{ridesToday}</strong>
      </div>

      <div className="stat-card">
        <span>Today's earnings</span>
        <strong>Rs. {earningsToday}</strong>
      </div>
    </section>
  );
}

export default Stats;
