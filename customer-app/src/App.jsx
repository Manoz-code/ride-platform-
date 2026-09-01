import { useState } from "react";

import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";

import { getAccessToken } from "./utils/storage.js";

function App() {
  const [loggedIn, setLoggedIn] = useState(
    Boolean(getAccessToken())
  );

  const [user, setUser] = useState(null);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setLoggedIn(true);
  };

  const handleLogout = () => {
    setUser(null);
    setLoggedIn(false);
  };

  if (!loggedIn) {
    return (
      <Login onLogin={handleLogin} />
    );
  }

  return (
    <Dashboard
      user={user}
      onLogout={handleLogout}
    />
  );
}

export default App;