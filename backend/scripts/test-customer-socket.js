import { io } from "socket.io-client";

const token = process.env.CUSTOMER_TOKEN;

if (!token) {
  console.error("CUSTOMER_TOKEN is not set.");
  process.exit(1);
}

const socket = io("http://localhost:5000", {
  auth: {
    token,
  },
});

socket.on("connect", () => {
  console.log("Customer socket connected:", socket.id);
  console.log("Waiting for ride:accepted...");
});

socket.on("ride:accepted", (payload) => {
  console.log("RECEIVED ride:accepted");
  console.log(JSON.stringify(payload, null, 2));
  socket.disconnect();
  process.exit(0);
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error.message);
  process.exit(1);
});

setTimeout(() => {
  console.error("Timed out waiting for ride:accepted");
  socket.disconnect();
  process.exit(1);
}, 30000);
