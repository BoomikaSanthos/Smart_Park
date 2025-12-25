// frontend/src/components/ParkingMap.jsx
import React, { useMemo, useRef, useState } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  StandaloneSearchBox,
} from "@react-google-maps/api";

const libraries = ["places"]; // important

// map container style (height / radius etc.)
const containerStyle = {
  width: "100%",
  height: "320px",
  borderRadius: "16px",
  overflow: "hidden",
};

// fallback center if slots have no coordinates
const defaultCenter = {
  lat: 28.6139,
  lng: 77.209,
};

function ParkingMap({ slots = [] }) {
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const searchBoxRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const initialCenter = useMemo(() => {
    const withCoords = slots.find(
      (s) => typeof s.latitude === "number" && typeof s.longitude === "number"
    );
    return withCoords
      ? { lat: withCoords.latitude, lng: withCoords.longitude }
      : defaultCenter;
  }, [slots]);

  if (!isLoaded) return <div style={{ height: 320 }}>Loading map…</div>;

  const onPlacesChanged = () => {
    const places = searchBoxRef.current.getPlaces();
    if (!places || !places.length) return;
    const place = places[0];
    const location = place.geometry?.location;
    if (!location) return;

    setMapCenter({
      lat: location.lat(),
      lng: location.lng(),
    });
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Search box floating on top of the map */}
      <div
        style={{
          position: "absolute",
          zIndex: 2,
          top: 12,
          left: "50%",
          transform: "translateX(-50%)",
          width: "80%",
        }}
      >
        <StandaloneSearchBox
          onLoad={(ref) => (searchBoxRef.current = ref)}
          onPlacesChanged={onPlacesChanged}
        >
          <input
            type="text"
            placeholder="Search location"
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: 999,
              border: "1px solid #d1d5db",
              outline: "none",
              fontSize: "13px",
            }}
          />
        </StandaloneSearchBox>
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter || initialCenter}
        zoom={16}
        options={{
          gestureHandling: "greedy",
          scrollwheel: true,
          draggable: true,
          disableDefaultUI: false,
          zoomControl: false,
          mapTypeControl: true,
          fullscreenControl: false,
          rotateControl: true,
        }}
      >
        {slots
          .filter(
            (s) =>
              typeof s.latitude === "number" &&
              typeof s.longitude === "number"
          )
          .map((slot) => (
            <Marker
              key={slot._id}
              position={{ lat: slot.latitude, lng: slot.longitude }}
              label={{
                text: String(slot.slotNumber),
                color: slot.isAvailable ? "#16a34a" : "#ef4444",
                fontSize: "10px",
              }}
            />
          ))}
      </GoogleMap>
    </div>
  );
}

export default React.memo(ParkingMap);
