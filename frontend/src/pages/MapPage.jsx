import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

function MapPage({ setPage }) {
  const [selectedState, setSelectedState] = useState(null);

  // ---------- MAP SETTINGS ----------
  const mapContainerStyle = {
    width: "100%",
    height: "380px",
    borderRadius: "15px",
    marginBottom: "20px"
  };

  const indiaCenter = { lat: 21.146633, lng: 79.08886 };

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API
  });

  // ---------- STATE DATA ----------
  const states = [
    { id: "tn", name: "Tamil Nadu", color: "#10b981", slots: 105, bg: "india.png" },
    { id: "ka", name: "Karnataka", color: "#f59e0b", slots: 115, bg: "karnataka.png" },
    { id: "mh", name: "Maharashtra", color: "#ec4899", slots: 120, bg: "maharashtra.png" },
    { id: "dl", name: "Delhi", color: "#3b82f6", slots: 90, bg: "delhi.png" },
    { id: "kl", name: "Kerala", color: "#059669", slots: 95, bg: "kerala.png" }
  ];

  // ---------- LOCATIONS ----------
  const parkingLocations = {
    tn: [
      { name: "Chennai Airport", type: "✈️", slots: 50, prefix: "TN-AIR", bg: "chennai-tn.png" },
      { name: "Express Mall", type: "🛒", slots: 30, prefix: "TN-EXP", bg: "express-tn.png" },
      { name: "Nehru Stadium", type: "🏟️", slots: 25, prefix: "TN-NEH", bg: "nehru-tn.png" }
    ],
    ka: [
      { name: "Bengaluru Airport", type: "✈️", slots: 45, prefix: "KA-BLR", bg: "BLRairport-ka.png" },
      { name: "UB City", type: "🛒", slots: 35, prefix: "KA-UBC", bg: "UBcity-ka.png" },
      { name: "Chinnaswamy Stadium", type: "🏟️", slots: 35, prefix: "KA-CHI", bg: "chinnaswamy-ka.png" }
    ],
    mh: [
      { name: "Mumbai T2 Airport", type: "✈️", slots: 50, prefix: "MH-MUM", bg: "Mumbaiairport-MH.png" },
      { name: "R City Mall", type: "🛒", slots: 35, prefix: "MH-PVR", bg: "Rcity-MH.png" },
      { name: "Wankhede", type: "🏟️", slots: 35, prefix: "MH-WNK", bg: "Wankhede-MH.png" }
    ],
    dl: [
      { name: "Delhi T3 Airport", type: "✈️", slots: 40, prefix: "DL-DEL", bg: "airport-dl.png" },
      { name: "Select Citywalk", type: "🛒", slots: 30, prefix: "DL-SAK", bg: "selectcitywalk-dl.png" },
      { name: "JLN Stadium", type: "🏟️", slots: 25, prefix: "DL-FRO", bg: "jlnstadium-dl.png" }
    ],
    kl: [
      { name: "Kochi Airport", type: "✈️", slots: 40, prefix: "KL-COK", bg: "kochin-kl.png" },
      { name: "Lulu Mall", type: "🛒", slots: 30, prefix: "KL-LUL", bg: "lulumall-kl.png" },
      { name: "JLN Stadium", type: "🏟️", slots: 25, prefix: "KL-JLN", bg: "nehrustadium-kl.png" }
    ]
  };

  // ---------- COORDINATES ----------
  const locationCoordinates = {
    tn: { lat: 11.1271, lng: 78.6569 },
    ka: { lat: 15.3173, lng: 75.7139 },
    mh: { lat: 19.7515, lng: 75.7139 },
    dl: { lat: 28.7041, lng: 77.1025 },
    kl: { lat: 10.8505, lng: 76.2711 },

    places: {
      "Chennai Airport": { lat: 12.9941, lng: 80.1709 },
      "Express Mall": { lat: 13.0418, lng: 80.212 },
      "Nehru Stadium": { lat: 13.0735, lng: 80.2607 },

      "Bengaluru Airport": { lat: 13.1989, lng: 77.7063 },
      "UB City": { lat: 12.9716, lng: 77.5963 },
      "Chinnaswamy Stadium": { lat: 12.9788, lng: 77.5996 },

      "Mumbai T2 Airport": { lat: 19.0896, lng: 72.8656 },
      "R City Mall": { lat: 19.1136, lng: 72.9092 },
      "Wankhede": { lat: 18.9388, lng: 72.8258 },

      "Delhi T3 Airport": { lat: 28.5562, lng: 77.1 },
      "Select Citywalk": { lat: 28.5286, lng: 77.2193 },
      "JLN Stadium": { lat: 28.5802, lng: 77.234 },

      "Kochi Airport": { lat: 10.152, lng: 76.4019 },
      "Lulu Mall": { lat: 10.029, lng: 76.3083 }
    }
  };

  return (
    <div className="map-page">
      <Navbar setPage={setPage} currentPage="map" />

      <main className="map-main">

        {/* GOOGLE MAP */}
        {isLoaded && (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={indiaCenter}
            zoom={5}
          >
            {/* State green markers */}
            {states.map((s) => (
              <Marker
                key={s.id}
                position={locationCoordinates[s.id]}
                icon={{
                  url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                }}
                onClick={() => setSelectedState(s.id)}
              />
            ))}

            {/* Location markers when state selected */}
            {selectedState &&
              parkingLocations[selectedState].map((loc) => (
                <Marker
                  key={loc.name}
                  position={locationCoordinates.places[loc.name]}
                  icon={{
                    url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                  }}
                />
              ))}
          </GoogleMap>
        )}

        <div className="side-by-side-container">
          {/* ---------- STATES SECTION ---------- */}
          <section className="states-section">
            <h2>Select State</h2>

            <div className="states-grid">
              {states.map((state) => (
                <div
                  key={state.id}
                  className={`state-card ${selectedState === state.id ? "active" : ""}`}
                  style={{
                    backgroundImage: `url(${state.bg})`,
                    backgroundColor: state.color
                  }}
                  onClick={() => setSelectedState(state.id)}
                >
                  <h3>{state.name}</h3>
                  <p>{state.slots} slots</p>
                </div>
              ))}
            </div>
          </section>

          {/* ---------- LOCATIONS SECTION ---------- */}
          <section className={`locations-section ${selectedState ? selectedState : ""}`}>
            {selectedState ? (
              <>
                <h2>{states.find((s) => s.id === selectedState)?.name} Parking</h2>

                <div className="locations-grid">
                  {parkingLocations[selectedState].map((location, idx) => (
                    <div
                      key={idx}
                      className="location-card"
                      style={{ backgroundImage: `url(${location.bg})` }}
                      onClick={() =>
                        setPage("slots", {
                          locationId: {
                            state: selectedState.toUpperCase(),
                            location: location.prefix
                          }
                        })
                      }
                    >
                      <span className="location-icon">{location.type}</span>
                      <h3>{location.name}</h3>
                      <p>{location.slots} slots</p>
                      <button className="view-slots-btn">View Slots</button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="no-selection">
                <h3>Select a State</h3>
                <p>View nearby airports, malls & stadiums</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default MapPage;
