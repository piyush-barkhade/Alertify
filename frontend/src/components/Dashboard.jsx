import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import SOSButton from "./SOSButton.jsx";
import Footer from "./Footer.jsx";
import {
  getUserDetails,
  addEmergencyContact,
  deleteEmergencyContact,
  verifyEmergencyContact,
} from "../services/api.js";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contact, setContact] = useState({ name: "", phone: "" });
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [otp, setOtp] = useState("");
  const [selectedPhone, setSelectedPhone] = useState(null);
  const [verifying, setVerifying] = useState(false);

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

    try {
      const response = await addEmergencyContact(user._id, contact);
      setUser((prevUser) => ({
        ...prevUser,
        emergencyContacts: response.data.emergencyContacts,
      }));
      setSelectedPhone(contact.phone);
      setVerifying(true);
      alert("✅ Contact added. Please verify using OTP sent to the number.");
      setContact({ name: "", phone: "" });
      setShowForm(false);
    } catch (error) {
      console.error("❌ Error adding contact:", error);
      setError(error.response?.data?.message || "Failed to add contact.");
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) return alert("Please enter the OTP.");
    try {
      const res = await verifyEmergencyContact(user._id, selectedPhone, otp);
      alert("✅ Contact verified successfully!");
      setUser((prevUser) => ({
        ...prevUser,
        emergencyContacts: res.data.contact
          ? prevUser.emergencyContacts.map((c) =>
              c.phone === res.data.contact.phone ? res.data.contact : c
            )
          : prevUser.emergencyContacts,
      }));
      setVerifying(false);
      setOtp("");
      setSelectedPhone(null);
    } catch (err) {
      alert(
        err.response?.data?.message || "❌ OTP verification failed. Try again."
      );
    }
  };

  const handleDeleteContact = async (contactId) => {
    try {
      const response = await deleteEmergencyContact(user._id, contactId);
      setUser((prevUser) => ({
        ...prevUser,
        emergencyContacts: response.data.emergencyContacts,
      }));
      alert("✅ Contact deleted successfully!");
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
                  {contact.name} - {contact.phone}{" "}
                  {contact.verified ? "✅ Verified" : "❌ Not Verified"}
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

        {verifying && (
          <div className="otp-verification">
            <h4>Enter OTP sent to {selectedPhone}</h4>
            <form onSubmit={handleVerifyOTP}>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
              <button type="submit">✅ Verify</button>
            </form>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Dashboard;
