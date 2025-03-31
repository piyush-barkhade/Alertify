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

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const sosData = {
          userId: user._id, // Make sure this matches backend expectations
          location: {
            lat: coords.latitude,
            lng: coords.longitude,
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
      },
      (error) => {
        alert(`❌ Location error: ${error.message}`);
      }
    );
  };

  return (
    <button onClick={triggerSOS} className="sos-button">
      🚨 SOS
    </button>
  );
};

export default SOSButton;
