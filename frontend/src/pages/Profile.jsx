// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch logged-in user
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token"); // JWT stored in localStorage
        const res = await axios.get("http://localhost:5000/api/user/profile", {
          headers: { "x-auth-token": token },
        });

        setUser(res.data.user);
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError(err.response?.data?.message || "Failed to fetch user profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading)
    return (
      <p className="text-center mt-10 text-gray-500 animate-pulse">
        Loading profile...
      </p>
    );
  if (error)
    return (
      <p className="text-center mt-10 text-red-500">
        {error}
      </p>
    );

  return (
    <div className="max-w-lg mx-auto mt-10 p-8 bg-white shadow-xl rounded-xl border border-gray-200">
      {/* Header */}
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-5xl mb-4">
          👤
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-1">{user.name}</h2>
        <p className="text-gray-500 mb-6">{user.email}</p>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg shadow-sm">
          <span>📞</span>
          <span>{user.phone || "-"}</span>
        </div>
        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg shadow-sm">
          <span>🚗</span>
          <span>{user.vehicleNumber}</span>
        </div>
        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg shadow-sm">
          <span>🛞</span>
          <span>{user.vehicleType}</span>
        </div>
        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg shadow-sm">
          <span>🛡️</span>
          <span
            className={
              user.role === "admin" ? "text-red-500 font-semibold" : "text-green-500 font-semibold"
            }
          >
            {user.role}
          </span>
        </div>
        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg shadow-sm col-span-full">
          <span>📅 Joined On:</span>
          <span>{new Date(user.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default Profile;
