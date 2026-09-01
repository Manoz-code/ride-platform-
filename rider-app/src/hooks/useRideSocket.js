import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../constants/config.js";

export const useRideSocket = ({
  token,
  onRideRequested,
  onRideAccepted,
}) => {
  const [connected, setConnected] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const socket = io(SOCKET_URL, {
      auth: {
        token,
      },
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      setConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
      setConnected(false);
    });

    socket.on("ride:requested", onRideRequested);
    socket.on("ride:accepted", onRideAccepted);

    return () => {
      socket.disconnect();
    };
  }, [token, onRideRequested, onRideAccepted]);

  return {
    connected,
  };
};
