import { useState } from "react";
import { requestRide } from "../services/ride.service.js";
import { getAccessToken } from "../utils/storage.js";
import "../styles/request-ride.css";

function RequestRide({ onBack, onRideCreated }) {
  const [form, setForm] = useState({
    pickupAddress: "",
    pickupLatitude: "",
    pickupLongitude: "",
    dropoffAddress: "",
    dropoffLatitude: "",
    dropoffLongitude: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const useCurrentLocation = () => {
    setError("");

    if (!navigator.geolocation) {
      setError("Location is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateField(
          "pickupLatitude",
          position.coords.latitude.toFixed(7)
        );

        updateField(
          "pickupLongitude",
          position.coords.longitude.toFixed(7)
        );

        if (!form.pickupAddress) {
          updateField("pickupAddress", "Current location");
        }
      },
      () => {
        setError(
          "Unable to get your location. Please enter the coordinates manually."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const pickupLatitude = Number(form.pickupLatitude);
    const pickupLongitude = Number(form.pickupLongitude);
    const dropoffLatitude = Number(form.dropoffLatitude);
    const dropoffLongitude = Number(form.dropoffLongitude);

    if (
      !Number.isFinite(pickupLatitude) ||
      !Number.isFinite(pickupLongitude) ||
      !Number.isFinite(dropoffLatitude) ||
      !Number.isFinite(dropoffLongitude)
    ) {
      setError("Please enter valid pickup and destination coordinates.");
      return;
    }

    try {
      setLoading(true);

      const token = getAccessToken();

      if (!token) {
        setError("Your session has expired. Please sign in again.");
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

      console.log("Ride requested:", result.ride);

      onRideCreated(result.ride);
    } catch (requestError) {
      console.error("Ride request failed:", requestError);

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
              Enter your pickup and destination to request a
              ride.
            </p>
          </div>

          {error && (
            <div className="request-error">
              {error}
            </div>
          )}

          <form
            className="request-ride-form"
            onSubmit={handleSubmit}
          >
            <div className="location-section">
              <div className="location-marker pickup-marker">
                A
              </div>

              <div className="location-fields">
                <label htmlFor="pickupAddress">
                  Pickup location
                </label>

                <input
                  id="pickupAddress"
                  type="text"
                  value={form.pickupAddress}
                  onChange={(event) =>
                    updateField(
                      "pickupAddress",
                      event.target.value
                    )
                  }
                  placeholder="Enter pickup address"
                  required
                />

                <div className="coordinate-row">
                  <input
                    type="number"
                    step="any"
                    value={form.pickupLatitude}
                    onChange={(event) =>
                      updateField(
                        "pickupLatitude",
                        event.target.value
                      )
                    }
                    placeholder="Latitude"
                    required
                  />

                  <input
                    type="number"
                    step="any"
                    value={form.pickupLongitude}
                    onChange={(event) =>
                      updateField(
                        "pickupLongitude",
                        event.target.value
                      )
                    }
                    placeholder="Longitude"
                    required
                  />
                </div>

                <button
                  type="button"
                  className="location-button"
                  onClick={useCurrentLocation}
                >
                  ◎ Use my current location
                </button>
              </div>
            </div>

            <div className="route-line" />

            <div className="location-section">
              <div className="location-marker destination-marker">
                B
              </div>

              <div className="location-fields">
                <label htmlFor="dropoffAddress">
                  Destination
                </label>

                <input
                  id="dropoffAddress"
                  type="text"
                  value={form.dropoffAddress}
                  onChange={(event) =>
                    updateField(
                      "dropoffAddress",
                      event.target.value
                    )
                  }
                  placeholder="Where should we take you?"
                  required
                />

                <div className="coordinate-row">
                  <input
                    type="number"
                    step="any"
                    value={form.dropoffLatitude}
                    onChange={(event) =>
                      updateField(
                        "dropoffLatitude",
                        event.target.value
                      )
                    }
                    placeholder="Latitude"
                    required
                  />

                  <input
                    type="number"
                    step="any"
                    value={form.dropoffLongitude}
                    onChange={(event) =>
                      updateField(
                        "dropoffLongitude",
                        event.target.value
                      )
                    }
                    placeholder="Longitude"
                    required
                  />
                </div>
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
              disabled={loading}
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
