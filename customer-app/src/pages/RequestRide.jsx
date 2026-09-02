import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";

import { requestRide } from "../services/ride.service.js";
import { getAccessToken } from "../utils/storage.js";

import "leaflet/dist/leaflet.css";
import "../styles/request-ride.css";

const DEFAULT_CENTER = [27.7172, 85.324];

const pickupIcon = L.divIcon({
  className: "custom-map-marker",
  html: `
    <div class="map-marker pickup-map-marker">
      <span>A</span>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const destinationIcon = L.divIcon({
  className: "custom-map-marker",
  html: `
    <div class="map-marker destination-map-marker">
      <span>B</span>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

function MapController({ location }) {
  const map = useMap();

  useEffect(() => {
    if (!location) return;

    map.flyTo(
      [location.latitude, location.longitude],
      16,
      {
        duration: 0.8,
      }
    );
  }, [location, map]);

  return null;
}

function MapClickHandler({ selecting, onSelect }) {
  useMapEvents({
    click: async (event) => {
      if (!selecting) return;

      const { lat, lng } = event.latlng;

      await onSelect(lat, lng);
    },
  });

  return null;
}

async function reverseGeocode(latitude, longitude) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
  );

  if (!response.ok) {
    throw new Error("Unable to find the address.");
  }

  const data = await response.json();

  return (
    data.display_name ||
    `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
  );
}

async function searchPlaces(query) {
  if (!query.trim()) return [];

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&q=${encodeURIComponent(
      query
    )}`
  );

  if (!response.ok) {
    throw new Error("Unable to search locations.");
  }

  return response.json();
}

function RequestRide({ onBack, onRideCreated }) {
  const [form, setForm] = useState({
    pickupAddress: "",
    pickupLatitude: "",
    pickupLongitude: "",
    dropoffAddress: "",
    dropoffLatitude: "",
    dropoffLongitude: "",
  });

  const [selecting, setSelecting] = useState("pickup");

  const [searchQuery, setSearchQuery] = useState("");

  const [searchResults, setSearchResults] = useState([]);

  const [searching, setSearching] = useState(false);

  const [loading, setLoading] = useState(false);

  const [locationLoading, setLocationLoading] =
    useState(false);

  const [error, setError] = useState("");

  const [pickupLocation, setPickupLocation] =
    useState(null);

  const [destinationLocation, setDestinationLocation] =
    useState(null);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const setLocation = (
    type,
    latitude,
    longitude,
    address
  ) => {
    const location = {
      latitude,
      longitude,
    };

    if (type === "pickup") {
      setPickupLocation(location);

      setForm((current) => ({
        ...current,
        pickupAddress: address,
        pickupLatitude: latitude.toFixed(7),
        pickupLongitude: longitude.toFixed(7),
      }));
    } else {
      setDestinationLocation(location);

      setForm((current) => ({
        ...current,
        dropoffAddress: address,
        dropoffLatitude: latitude.toFixed(7),
        dropoffLongitude: longitude.toFixed(7),
      }));
    }
  };

  const selectMapLocation = async (
    latitude,
    longitude
  ) => {
    try {
      setError("");

      const address = await reverseGeocode(
        latitude,
        longitude
      );

      setLocation(
        selecting,
        latitude,
        longitude,
        address
      );
    } catch (locationError) {
      console.error(
        "Reverse geocoding failed:",
        locationError
      );

      const address = `${latitude.toFixed(
        6
      )}, ${longitude.toFixed(6)}`;

      setLocation(
        selecting,
        latitude,
        longitude,
        address
      );
    }
  };

  const useCurrentLocation = () => {
    setError("");

    if (!navigator.geolocation) {
      setError(
        "Location is not supported by this browser."
      );
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;

        try {
          const address = await reverseGeocode(
            latitude,
            longitude
          );

          setLocation(
            "pickup",
            latitude,
            longitude,
            address
          );

          setSelecting("destination");
        } catch (locationError) {
          console.error(
            "Reverse geocoding failed:",
            locationError
          );

          setLocation(
            "pickup",
            latitude,
            longitude,
            "Current location"
          );

          setSelecting("destination");
        } finally {
          setLocationLoading(false);
        }
      },
      (locationError) => {
        console.error(
          "Geolocation error:",
          locationError
        );

        setError(
          "Unable to get your current location. Please select your pickup on the map."
        );

        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      setError("");

      const results = await searchPlaces(
        searchQuery
      );

      setSearchResults(results);
    } catch (searchError) {
      console.error(
        "Location search failed:",
        searchError
      );

      setError(
        "Unable to search locations. Please try again."
      );
    } finally {
      setSearching(false);
    }
  };

  const selectSearchResult = (result) => {
    const latitude = Number(result.lat);
    const longitude = Number(result.lon);

    setLocation(
      selecting,
      latitude,
      longitude,
      result.display_name
    );

    setSearchQuery("");
    setSearchResults([]);

    if (selecting === "pickup") {
      setSelecting("destination");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const pickupLatitude = Number(
      form.pickupLatitude
    );

    const pickupLongitude = Number(
      form.pickupLongitude
    );

    const dropoffLatitude = Number(
      form.dropoffLatitude
    );

    const dropoffLongitude = Number(
      form.dropoffLongitude
    );

    if (
      !form.pickupAddress ||
      !form.dropoffAddress
    ) {
      setError(
        "Please select both pickup and destination."
      );
      return;
    }

    if (
      !Number.isFinite(pickupLatitude) ||
      !Number.isFinite(pickupLongitude) ||
      !Number.isFinite(dropoffLatitude) ||
      !Number.isFinite(dropoffLongitude)
    ) {
      setError(
        "Please select valid pickup and destination locations."
      );
      return;
    }

    try {
      setLoading(true);

      const token = getAccessToken();

      if (!token) {
        setError(
          "Your session has expired. Please sign in again."
        );
        return;
      }

      const result = await requestRide(token, {
        pickupAddress: form.pickupAddress,
        pickupLatitude,
        pickupLongitude,

        dropoffAddress: form.dropoffAddress,
        dropoffLatitude,
        dropoffLongitude,
      });

      console.log(
        "Ride requested:",
        result.ride
      );

      onRideCreated(result.ride);
    } catch (requestError) {
      console.error(
        "Ride request failed:",
        requestError
      );

      setError(
        requestError.message ||
          "Unable to request the ride. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="request-ride-page">
      <div className="request-ride-container">
        <button
          type="button"
          className="back-button"
          onClick={onBack}
        >
          ← Back to dashboard
        </button>

        <section className="request-ride-card">
          <div className="request-ride-header">
            <span className="request-ride-badge">
              New Ride
            </span>

            <h1>Where are you going?</h1>

            <p>
              Select your pickup and destination on
              the map.
            </p>
          </div>

          {error && (
            <div className="request-error">
              {error}
            </div>
          )}

          <div className="location-selector">
            <button
              type="button"
              className={
                selecting === "pickup"
                  ? "location-select active"
                  : "location-select"
              }
              onClick={() => setSelecting("pickup")}
            >
              <span className="selector-dot pickup-selector">
                A
              </span>

              <span>
                <small>Pickup</small>
                <strong>
                  {form.pickupAddress ||
                    "Select pickup location"}
                </strong>
              </span>
            </button>

            <button
              type="button"
              className={
                selecting === "destination"
                  ? "location-select active"
                  : "location-select"
              }
              onClick={() =>
                setSelecting("destination")
              }
            >
              <span className="selector-dot destination-selector">
                B
              </span>

              <span>
                <small>Destination</small>
                <strong>
                  {form.dropoffAddress ||
                    "Where should we take you?"}
                </strong>
              </span>
            </button>
          </div>

          <div className="map-section">
            <MapContainer
              center={DEFAULT_CENTER}
              zoom={13}
              scrollWheelZoom={true}
              className="ride-map"
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapController
                location={
                  selecting === "pickup"
                    ? pickupLocation
                    : destinationLocation
                }
              />

              <MapClickHandler
                selecting={selecting}
                onSelect={selectMapLocation}
              />

              {pickupLocation && (
                <Marker
                  position={[
                    pickupLocation.latitude,
                    pickupLocation.longitude,
                  ]}
                  icon={pickupIcon}
                />
              )}

              {destinationLocation && (
                <Marker
                  position={[
                    destinationLocation.latitude,
                    destinationLocation.longitude,
                  ]}
                  icon={destinationIcon}
                />
              )}
            </MapContainer>

            <div className="map-instruction">
              <span>●</span>

              {selecting === "pickup"
                ? "Tap the map to select your pickup"
                : "Tap the map to select your destination"}
            </div>
          </div>

          <div className="map-tools">
            <button
              type="button"
              className="current-location-button"
              onClick={useCurrentLocation}
              disabled={locationLoading}
            >
              {locationLoading
                ? "Finding your location..."
                : "◎ Use my current location"}
            </button>
          </div>

          <div className="search-section">
            <div className="search-label">
              <span>
                Search{" "}
                {selecting === "pickup"
                  ? "pickup"
                  : "destination"}
              </span>
            </div>

            <div className="search-box">
              <span className="search-icon">
                🔎
              </span>

              <input
                type="text"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleSearch();
                  }
                }}
                placeholder={
                  selecting === "pickup"
                    ? "Search pickup location"
                    : "Search destination"
                }
              />

              <button
                type="button"
                onClick={handleSearch}
                disabled={searching}
              >
                {searching
                  ? "Searching..."
                  : "Search"}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((result) => (
                  <button
                    type="button"
                    key={result.place_id}
                    className="search-result"
                    onClick={() =>
                      selectSearchResult(
                        result
                      )
                    }
                  >
                    <span className="result-icon">
                      📍
                    </span>

                    <span>
                      {result.display_name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            className="request-ride-form"
            onSubmit={handleSubmit}
          >
            <div className="selected-location">
              <div className="selected-location-marker pickup-selector">
                A
              </div>

              <div>
                <small>Pickup</small>

                <strong>
                  {form.pickupAddress ||
                    "Not selected"}
                </strong>

                {form.pickupLatitude &&
                  form.pickupLongitude && (
                    <span>
                      {form.pickupLatitude},{" "}
                      {form.pickupLongitude}
                    </span>
                  )}
              </div>
            </div>

            <div className="selected-location">
              <div className="selected-location-marker destination-selector">
                B
              </div>

              <div>
                <small>Destination</small>

                <strong>
                  {form.dropoffAddress ||
                    "Not selected"}
                </strong>

                {form.dropoffLatitude &&
                  form.dropoffLongitude && (
                    <span>
                      {form.dropoffLatitude},{" "}
                      {form.dropoffLongitude}
                    </span>
                  )}
              </div>
            </div>

            <div className="ride-info-card">
              <div>
                <span className="info-label">
                  Service
                </span>

                <strong>Bike</strong>
              </div>

              <div>
                <span className="info-label">
                  Payment
                </span>

                <strong>Cash</strong>
              </div>

              <div>
                <span className="info-label">
                  Status
                </span>

                <strong>Requested</strong>
              </div>
            </div>

            <button
              type="submit"
              className="request-button"
              disabled={
                loading ||
                !form.pickupLatitude ||
                !form.dropoffLatitude
              }
            >
              {loading
                ? "Requesting ride..."
                : "Request Ride"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

export default RequestRide;
