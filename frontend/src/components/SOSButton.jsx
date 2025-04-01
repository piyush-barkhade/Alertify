import { useEffect, useState } from "react";
import { sendSOS } from "../services/api.js";
import "../styles/SOSButton.css";

const SOSButton = ({ user: propUser }) => {
  const [user, setUser] = useState(propUser || null);

  useEffect(() => {
    if (!propUser) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, [propUser]);

  const triggerSOS = async () => {
    if (!user || !user._id) {
      alert("❌ You must be logged in to send an SOS.");
      return;
    }

    if (!navigator.geolocation) {
      alert("❌ Location not supported");
      return;
    }

    const handleSuccess = async ({ coords }) => {
      const sosData = {
        userId: user._id,
        location: {
          lat: coords.latitude.toFixed(6), // Accurate location data
          lng: coords.longitude.toFixed(6), // Accurate location data
          accuracy: coords.accuracy, // Include accuracy
        },
      };

      try {
        const response = await sendSOS(sosData);
        alert("🚨 SOS Alert Sent!");
        console.log("✅ SOS Response:", response.data);
      } catch (error) {
        console.error("❌ Error sending SOS:", error);
        alert(error.response?.data?.message || "Failed to send SOS.");
      }
    };

    const handleError = (error) => {
      alert(`❌ Location error: ${error.message}`);
      console.error("❌ Location error:", error);
    };

    // Use `watchPosition` for real-time accuracy
    const options = {
      enableHighAccuracy: true, // Ensure high accuracy
      timeout: 10000, // Max wait time for location
      maximumAge: 0, // No caching of old positions
    };

    navigator.geolocation.watchPosition(handleSuccess, handleError, options);
  };

  return (
    <button onClick={triggerSOS} className="sos-button">
      🚨 SOS
    </button>
  );
};

export default SOSButton;
