function WelcomeCard({ online }) {
  return (
    <section className="welcome-card">
      <p className="eyebrow">RIDER DASHBOARD</p>

      <h2>Welcome back 👋</h2>

      <p>
        {online
          ? "You are online and ready to receive rides."
          : "Go online to start receiving rides."}
      </p>
    </section>
  );
}

export default WelcomeCard;
