import { useEffect, useRef, useState } from "react";

export const useRiderLocation = ({
  socket,
  enabled,
}) => {
  const watchIdRef = useRef(null);
  const lastSentRef = useRef(null);

  const [location, setLocation] = useState(null);
  const [gpsError, setGpsError] = useState("");

  useEffect(() => {
    // Stop GPS when tracking is disabled.
    if (!enabled || !socket) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(
          watchIdRef.current
        );

        watchIdRef.current = null;
      }

      return;
    }

    if (!navigator.geolocation) {
      setGpsError(
        "GPS is not supported by this device."
      );

      return;
    }

    setGpsError("");

    const handlePosition = (position) => {
      const {
        latitude,
        longitude,
        accuracy,
      } = position.coords;

      const nextLocation = {
        latitude,
        longitude,
        accuracy,
      };

      setLocation(nextLocation);

      /*
       * Avoid flooding the server.
       *
       * Send when:
       * - this is the first position
       * - rider moved at least ~5 meters
       * - OR enough time has passed
       */
      const now = Date.now();

      const previous = lastSentRef.current;

      let shouldSend = true;

      if (previous) {
        const timePassed =
          now - previous.timestamp;

        const distance = getDistanceInMeters(
          previous.latitude,
          previous.longitude,
          latitude,
          longitude
        );

        shouldSend =
          distance >= 5 ||
          timePassed >= 3000;
      }

      if (!shouldSend) {
        return;
      }

      lastSentRef.current = {
        latitude,
        longitude,
        timestamp: now,
      };

      socket.emit(
        "rider:location:update",
        nextLocation
      );

      console.log(
        "GPS sent:",
        nextLocation
      );
    };

    const handleError = (error) => {
      console.error(
        "GPS error:",
        error
      );

      switch (error.code) {
        case 1:
          setGpsError(
            "Location permission was denied."
          );
          break;

        case 2:
          setGpsError(
            "Unable to determine your location."
          );
          break;

        case 3:
          setGpsError(
            "GPS request timed out."
          );
          break;

        default:
          setGpsError(
            "Unable to access GPS."
          );
      }
    };

    watchIdRef.current =
      navigator.geolocation.watchPosition(
        handlePosition,
        handleError,
        {
          enableHighAccuracy: true,
          maximumAge: 2000,
          timeout: 10000,
        }
      );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(
          watchIdRef.current
        );

        watchIdRef.current = null;
      }
    };
  }, [enabled, socket]);

  return {
    location,
    gpsError,
  };
};

/**
 * Calculate distance between two GPS coordinates.
 * Uses the Haversine formula.
 */
const getDistanceInMeters = (
  latitude1,
  longitude1,
  latitude2,
  longitude2
) => {
  const earthRadius = 6371000;

  const toRadians = (degrees) =>
    (degrees * Math.PI) / 180;

  const lat1 = toRadians(latitude1);
  const lat2 = toRadians(latitude2);

  const deltaLatitude = toRadians(
    latitude2 - latitude1
  );

  const deltaLongitude = toRadians(
    longitude2 - longitude1
  );

  const a =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLongitude / 2) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return earthRadius * c;
};
