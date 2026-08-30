import "dotenv/config";

const GOOGLE_ROUTES_URL =
  "https://routes.googleapis.com/directions/v2:computeRoutes";

const response = await fetch(GOOGLE_ROUTES_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Goog-Api-Key": process.env.GOOGLE_MAPS_API_KEY,
    "X-Goog-FieldMask": "routes.distanceMeters,routes.duration",
  },
  body: JSON.stringify({
    origin: {
      location: {
        latLng: {
          latitude: 27.013,
          longitude: 85.923
        }
      }
    },
    destination: {
      location: {
        latLng: {
          latitude: 27.017,
          longitude: 85.930
        }
      }
    },
    travelMode: "DRIVE",
    routingPreference: "TRAFFIC_AWARE",
    computeAlternativeRoutes: false,
    units: "METRIC"
  })
});

const data = await response.json();

console.log("HTTP:", response.status);

if (!response.ok) {
  console.error(JSON.stringify(data, null, 2));
  process.exit(1);
}

console.log(JSON.stringify(data, null, 2));
