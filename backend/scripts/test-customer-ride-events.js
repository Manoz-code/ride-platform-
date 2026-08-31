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
  console.log("Waiting for ride events...");
});

socket.on("ride:accepted", (payload) => {
  console.log("\nRECEIVED ride:accepted");
  console.log(JSON.stringify(payload, null, 2));
});

socket.on("ride:started", (payload) => {
  console.log("\nRECEIVED ride:started");
  console.log(JSON.stringify(payload, null, 2));
});

socket.on("ride:completed", (payload) => {
  console.log("\nRECEIVED ride:completed");
  console.log(JSON.stringify(payload, null, 2));

  console.log("\nAll ride lifecycle events received.");
  socket.disconnect();
  process.exit(0);
});

socket.on("ride:cancelled", (payload) => {
  console.log("\nRECEIVED ride:cancelled");
  console.log(JSON.stringify(payload, null, 2));
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error.message);
  process.exit(1);
});

setTimeout(() => {
  console.error("\nTimed out waiting for ride events.");
  socket.disconnect();
  process.exit(1);
}, 120000);
