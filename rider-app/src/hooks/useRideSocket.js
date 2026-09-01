import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../constants/config.js";

export const useRideSocket = ({
  token,
  onRideRequested,
  onRideAccepted,
}) => {
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!token) {
      setSocket(null);
      setConnected(false);
      return undefined;
    }

    const newSocket = io(SOCKET_URL, {
      auth: {
        token,
      },
    });

    newSocket.on("connect", () => {
      console.log(
        "Socket connected:",
        newSocket.id
      );

      setConnected(true);
      setSocket(newSocket);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");

      setConnected(false);
    });

    newSocket.on(
      "connect_error",
      (error) => {
        console.error(
          "Socket connection error:",
          error.message
        );

        setConnected(false);
      }
    );

    newSocket.on(
      "ride:requested",
      onRideRequested
    );

    newSocket.on(
      "ride:accepted",
      onRideAccepted
    );

    return () => {
      newSocket.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [
    token,
    onRideRequested,
    onRideAccepted,
  ]);

  return {
    connected,
    socket,
  };
};
