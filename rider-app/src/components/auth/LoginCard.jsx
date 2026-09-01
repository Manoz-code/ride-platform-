function LoginCard({
  loading,
  onLogin,
}) {
  return (
    <section className="login-card">
      <p className="eyebrow">RIDER LOGIN</p>

      <h2>Welcome, Rider 👋</h2>

      <p>
        Login to connect to the ride platform and receive
        ride requests.
      </p>

      <button
        className="primary-button"
        onClick={onLogin}
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login as Test Rider"}
      </button>
    </section>
  );
}

export default LoginCard;
