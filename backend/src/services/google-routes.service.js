const GOOGLE_ROUTES_URL =
  "https://routes.googleapis.com/directions/v2:computeRoutes";

export const computeRoute = async ({
  pickupLatitude,
  pickupLongitude,
  dropoffLatitude,
  dropoffLongitude,
}) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    const error = new Error("Google Maps API key is not configured.");
    error.statusCode = 500;
    throw error;
  }

  const response = await fetch(GOOGLE_ROUTES_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline",
    },
    body: JSON.stringify({
      origin: {
        location: {
          latLng: {
            latitude: pickupLatitude,
            longitude: pickupLongitude,
          },
        },
      },
      destination: {
        location: {
          latLng: {
            latitude: dropoffLatitude,
            longitude: dropoffLongitude,
          },
        },
      },
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_AWARE",
      computeAlternativeRoutes: false,
      units: "METRIC",
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Google Routes API error:", data);

    const error = new Error("Unable to calculate route.");
    error.statusCode = 502;
    throw error;
  }

  const route = data.routes?.[0];

  if (!route) {
    const error = new Error("No route found.");
    error.statusCode = 422;
    throw error;
  }

  return {
    provider: "google",
    distanceMeters: route.distanceMeters,
    durationSeconds: parseDuration(route.duration),
    encodedPolyline: route.polyline?.encodedPolyline ?? null,
  };
};

const parseDuration = (duration) => {
  if (!duration) {
    return 0;
  }

  return Math.round(Number(duration.replace("s", "")));
};