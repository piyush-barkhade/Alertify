import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import SOSButton from "./SOSButton.jsx";
import {
  getUserDetails,
  addEmergencyContact,
  deleteEmergencyContact,
} from "../services/api.js"; // ✅ Import API functions
import "../styles/Dashboard.css";
import Footer from "./Footer.jsx";

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

  // ✅ Handle adding a contact
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
      function showContactSuccessModal() {
        const modal = document.createElement("div");
        modal.innerHTML = `
          <div style="position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:#fff; padding:20px 30px; box-shadow:0 4px 20px rgba(0,0,0,0.2); border-radius:8px; z-index:1000; font-family:sans-serif;">
            <h3 style="margin:0 0 10px;">✅ Contact Added Successfully!</h3>
            <p style="margin:0 0 10px;">Now verify the caller ID on Twilio:</p>
            <a href="https://www.twilio.com/console/phone-numbers/verified" target="_blank" style="color:#007aff;">Go to Twilio Verified Caller IDs</a><br><br>
            <button onclick="this.parentElement.remove()" style="margin-top:10px; padding:6px 12px; background:#007aff; color:#fff; border:none; border-radius:4px;">Close</button>
          </div>
        `;
        document.body.appendChild(modal);
      }

      const response = await addEmergencyContact(user._id, contact);
      setUser((prevUser) => ({
        ...prevUser,
        emergencyContacts: response.data.emergencyContacts,
      }));
      setContact({ name: "", phone: "" });
      setShowForm(false);
      showContactSuccessModal();
    } catch (error) {
      console.error("❌ Error adding contact:", error);
      setError(error.response?.data?.message || "Failed to add contact.");
    }
  };

  // ✅ Handle deleting a contact
  const handleDeleteContact = async (contactId) => {
    try {
      // ✅ Custom Modal for Delete
      function showContactDeletedModal() {
        const modal = document.createElement("div");
        modal.innerHTML = `
    <div style="position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:#fff; padding:20px 30px; box-shadow:0 4px 20px rgba(0,0,0,0.2); border-radius:8px; z-index:1000; font-family:sans-serif;">
      <h3 style="margin:0 0 10px;">🗑️ Contact Deleted Successfully!</h3>
      <p style="margin:0 0 10px;">The contact has been removed from your emergency list.</p>
      <p style="margin:0 0 10px;">Now also delete the caller ID on Twilio:</p>
            <a href="https://www.twilio.com/console/phone-numbers/verified" target="_blank" style="color:#007aff;">Go to Twilio Verified Caller IDs</a><br><br>
      <button id="closeDeleteModalBtn" style="margin-top:10px; padding:6px 12px; background:#d9534f; color:#fff; border:none; border-radius:4px;">Close</button>
    </div>
  `;
        document.body.appendChild(modal);
        modal.querySelector("#closeDeleteModalBtn").onclick = () =>
          modal.remove();
      }

      const response = await deleteEmergencyContact(user._id, contactId);
      setUser((prevUser) => ({
        ...prevUser,
        emergencyContacts: response.data.emergencyContacts,
      }));
      showContactDeletedModal();
    } catch (error) {
      console.error("❌ Error deleting contact:", error);
      alert(error.response?.data?.message || "Failed to delete contact.");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <div className="dashboard">
        <Navbar />
        <h2>Welcome, {user?.name}!</h2>

        <SOSButton user={user} />

        {user?.emergencyContacts?.length > 0 ? (
          <div className="emergency-contacts">
            <h3>Emergency Contacts</h3>
            <ul>
              {user.emergencyContacts.map((contact) => (
                <li key={contact._id}>
                  {contact.name} - {contact.phone}
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteContact(contact._id)}
                  >
                    ❌ Delete
                  </button>
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
            <button onClick={() => setShowForm(true)}>➕ Add Contact</button>
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
                </button>
              </form>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Dashboard;
