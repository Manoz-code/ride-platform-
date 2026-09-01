
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import { useCallback, useEffect, useMemo, useState } from "react";

import "leaflet/dist/leaflet.css";
import "./RideMap.css";

// =====================================================
// LEAFLET DEFAULT MARKER FIX
// =====================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// =====================================================
// ROAD ROUTE
// =====================================================

function RouteLine({
  pickup,
  dropoff,
  onRouteReady,
}) {
  const [route, setRoute] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const loadRoute = async () => {
      try {
        const url =
          `https://router.project-osrm.org/route/v1/driving/` +
          `${pickup.lng},${pickup.lat};` +
          `${dropoff.lng},${dropoff.lat}` +
          `?overview=full&geometries=geojson`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Routing request failed.");
        }

        const data = await response.json();

        if (!data.routes?.length) {
          throw new Error("No route found.");
        }

        const coordinates =
          data.routes[0].geometry.coordinates.map(
            ([lng, lat]) => [lat, lng]
          );

        if (!cancelled) {
          setRoute(coordinates);
          onRouteReady(coordinates);
        }
      } catch (error) {
        console.error("Route loading failed:", error);

        if (!cancelled) {
          const fallback = [
            [pickup.lat, pickup.lng],
            [dropoff.lat, dropoff.lng],
          ];

          setRoute(fallback);
          onRouteReady(fallback);
        }
      }
    };

    loadRoute();

    return () => {
      cancelled = true;
    };
  }, [pickup, dropoff, onRouteReady]);

  if (!route.length) {
    return null;
  }

  return (
    <Polyline
      positions={route}
      pathOptions={{
        weight: 5,
        opacity: 0.85,
      }}
    />
  );
}

// =====================================================
// FIT MAP TO ROUTE
// =====================================================

function MapBounds({ route }) {
  const map = useMap();

  useEffect(() => {
    if (!route?.length) {
      return;
    }

    const bounds = L.latLngBounds(route);

    map.fitBounds(bounds, {
      padding: [35, 35],
    });
  }, [map, route]);

  return null;
}

// =====================================================
// FOLLOW RIDER
// =====================================================

function FollowRider({ position }) {
  const map = useMap();

  useEffect(() => {
    if (!position) {
      return;
    }

    map.panTo(position, {
      animate: true,
      duration: 0.5,
    });
  }, [map, position]);

  return null;
}

// =====================================================
// GPS TRACKING
// =====================================================

function useRiderLocation(enabled) {
  const [location, setLocation] = useState(null);
  const [gpsError, setGpsError] = useState("");

  useEffect(() => {
    if (!enabled) {
      setLocation(null);
      setGpsError("");
      return;
    }

    if (!navigator.geolocation) {
      setGpsError(
        "GPS is not supported by this device."
      );

      return;
    }

    setGpsError("");

    const watchId =
      navigator.geolocation.watchPosition(
        (position) => {
          const {
            latitude,
            longitude,
            accuracy,
            heading,
          } = position.coords;

          setLocation({
            lat: latitude,
            lng: longitude,
            accuracy,
            heading,
          });

          setGpsError("");
        },
        (error) => {
          console.error(
            "GPS error:",
            error
          );

          switch (error.code) {
            case error.PERMISSION_DENIED:
              setGpsError(
                "Location permission was denied."
              );
              break;

            case error.POSITION_UNAVAILABLE:
              setGpsError(
                "Current location is unavailable."
              );
              break;

            case error.TIMEOUT:
              setGpsError(
                "GPS request timed out."
              );
              break;

            default:
              setGpsError(
                "Unable to get your location."
              );
          }
        },
        {
          enableHighAccuracy: true,

          maximumAge: 2000,

          timeout: 10000,
        }
      );

    return () => {
      navigator.geolocation.clearWatch(
        watchId
      );
    };
  }, [enabled]);

  return {
    location,
    gpsError,
  };
}

// =====================================================
// BIKE ICON
// =====================================================

function createBikeIcon(rotation = 0) {
  return L.divIcon({
    className: "bike-marker-wrapper",

    html: `
      <div
        class="bike-marker"
        style="transform: rotate(${rotation}deg);"
      >
        🛵
      </div>
    `,

    iconSize: [44, 44],

    iconAnchor: [22, 22],
  });
}

// =====================================================
// MAIN RIDE MAP
// =====================================================

function RideMap({
  pickupLatitude,
  pickupLongitude,
  dropoffLatitude,
  dropoffLongitude,

  rideStatus = "in_progress",
}) {
  const pickup = useMemo(
    () => ({
      lat: Number(pickupLatitude),
      lng: Number(pickupLongitude),
    }),
    [pickupLatitude, pickupLongitude]
  );

  const dropoff = useMemo(
    () => ({
      lat: Number(dropoffLatitude),
      lng: Number(dropoffLongitude),
    }),
    [dropoffLatitude, dropoffLongitude]
  );

  const [route, setRoute] = useState([]);

  // GPS only runs while ride is in progress.
  const gpsEnabled =
    rideStatus === "in_progress";

  const {
    location,
    gpsError,
  } = useRiderLocation(gpsEnabled);

  const handleRouteReady = useCallback(
    (newRoute) => {
      setRoute(newRoute);
    },
    []
  );

  const coordinatesAreValid =
    Number.isFinite(pickup.lat) &&
    Number.isFinite(pickup.lng) &&
    Number.isFinite(dropoff.lat) &&
    Number.isFinite(dropoff.lng);

  if (!coordinatesAreValid) {
    return (
      <div className="ride-map ride-map-error">
        <span>
          Map location unavailable
        </span>
      </div>
    );
  }

  const center = [
    (pickup.lat + dropoff.lat) / 2,
    (pickup.lng + dropoff.lng) / 2,
  ];

  /*
   * Use the phone's GPS heading when available.
   *
   * Leaflet's 0 degrees points north.
   * The emoji itself faces roughly right,
   * so rotate it accordingly.
   */
  const bikeRotation =
    location?.heading != null &&
    Number.isFinite(location.heading)
      ? location.heading
      : 0;

  return (
    <div className="ride-map">

      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        dragging={true}
        zoomControl={true}
        className="ride-map-container"
      >

        {/* OpenStreetMap */}
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Pickup */}
        <Marker
          position={[
            pickup.lat,
            pickup.lng,
          ]}
        />

        {/* Destination */}
        <Marker
          position={[
            dropoff.lat,
            dropoff.lng,
          ]}
        />

        {/* Actual road route */}
        <RouteLine
          pickup={pickup}
          dropoff={dropoff}
          onRouteReady={handleRouteReady}
        />

        {/* Automatically frame the route */}
        {!location && (
          <MapBounds
            route={route}
          />
        )}

        {/* Follow the rider when GPS is active */}
        {location && (
          <FollowRider
            position={[
              location.lat,
              location.lng,
            ]}
          />
        )}

        {/* Real rider GPS marker */}
        {location && (
          <Marker
            position={[
              location.lat,
              location.lng,
            ]}
            icon={createBikeIcon(
              bikeRotation
            )}
            zIndexOffset={1000}
          />
        )}

      </MapContainer>

      {/* GPS status */}
      <div className="ride-map-status">

        <span
          className={`status-dot ${
            location
              ? "gps-active"
              : "gps-waiting"
          }`}
        />

        <span>
          {location
            ? "GPS tracking active"
            : gpsError
              ? "GPS unavailable"
              : "Waiting for GPS..."}
        </span>

      </div>

      {/* GPS error */}
      {gpsError && (
        <div className="ride-gps-error">
          📍 {gpsError}
        </div>
      )}

      {/* Accuracy */}
      {location?.accuracy && (
        <div className="gps-accuracy">
          GPS ±
          {Math.round(
            location.accuracy
          )}
          m
        </div>
      )}

    </div>
  );
}

export default RideMap;

