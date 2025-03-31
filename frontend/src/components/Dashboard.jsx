import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import SOSButton from "./SOSButton.jsx";
import { getUserDetails, addEmergencyContact } from "../services/api.js"; // ✅ Import API function
import "../styles/Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contact, setContact] = useState({ name: "", phone: "" });
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false); // ✅ Controls form visibility

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await getUserDetails();
        setUser(data);
      } catch (error) {
        console.error("❌ Error fetching user:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleAddContact = async (e) => {
    e.preventDefault();
    setError(null);

    if (!contact.name.trim() || !contact.phone.trim()) {
      setError("Please enter both name and phone number.");
      return;
    }

    if (!/^\d+$/.test(contact.phone)) {
      setError("Phone number must contain only digits.");
      return;
    }

    if (!user?._id) {
      setError("User ID is missing. Please log in again.");
      return;
    }

    try {
      const response = await addEmergencyContact(user._id, contact);
      setUser((prevUser) => ({
        ...prevUser,
        emergencyContacts: response.data.emergencyContacts,
      }));

      setContact({ name: "", phone: "" });
      setShowForm(false); // ✅ Hide form after successful addition
      alert("✅ Contact added successfully!");
    } catch (error) {
      console.error("❌ Error adding contact:", error);
      setError(error.response?.data?.message || "Failed to add contact.");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="dashboard">
      <Navbar />
      <h2>Welcome, {user?.name}!</h2>

      <SOSButton user={user} />

      {user?.emergencyContacts?.length > 0 ? (
        <div className="emergency-contacts">
          <h3>Emergency Contacts</h3>
          <ul>
            {user.emergencyContacts.map((contact, index) => (
              <li key={index}>
                {contact.name} - {contact.phone}
              </li>
            ))}
          </ul>
          <p>Total Alerts Sent: {user.alertsSent}</p>
        </div>
      ) : (
        <p>No emergency contacts added.</p>
      )}

      {/* ===== Add Contact Section ===== */}
      <div className="add-contact">
        {!showForm ? (
          <button onClick={() => setShowForm(true)}>➕ Add Contact</button> // ✅ Show button
        ) : (
          <>
            <h3>Add Emergency Contact</h3>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleAddContact}>
              <input
                type="text"
                placeholder="Contact Name"
                value={contact.name}
                onChange={(e) =>
                  setContact({ ...contact, name: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="Phone (Numbers Only)"
                value={contact.phone}
                onChange={(e) =>
                  setContact({ ...contact, phone: e.target.value })
                }
                required
              />
              <button type="submit">✅ Save Contact</button>
              <button type="button" onClick={() => setShowForm(false)}>
                ❌ Cancel
              </button>{" "}
              {/* ✅ Close form */}
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
