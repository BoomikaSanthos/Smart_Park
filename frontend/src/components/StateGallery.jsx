import React from "react";
import { useNavigate } from "react-router-dom";
import "./StateGallery.css";

const STATES = [
  {
    id: "TN",
    name: "Tamil Nadu",
    image:
      "https://images.pexels.com/photos/210182/pexels-photo-210182.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: "KA",
    name: "Karnataka",
    image:
      "https://images.pexels.com/photos/2229863/pexels-photo-2229863.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: "MH",
    name: "Maharashtra",
    image:
      "https://images.pexels.com/photos/1004409/pexels-photo-1004409.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
];

const StateGallery = () => {
  const navigate = useNavigate();

  const handleClick = (stateId) => {
    // This redirect is the key
    navigate(`/slots?state=${stateId}`);
  };

  return (
    <div className="state-gallery">
      <h3 className="state-title">Select Place</h3>
      <div className="state-grid">
        {STATES.map((s) => (
          <button
            key={s.id}
            className="state-card"
            onClick={() => handleClick(s.id)}
          >
            <img src={s.image} alt={s.name} className="state-image" />
            <span className="state-name">{s.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StateGallery;
