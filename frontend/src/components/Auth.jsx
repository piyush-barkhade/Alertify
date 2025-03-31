import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../services/api";
import "../styles/Auth.css";

const Auth = ({ isLogin }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    emergencyContacts: [],
  });
  const [contact, setContact] = useState({ name: "", phone: "" });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // ✅ Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const { data } = await login({
        email: formData.email,
        password: formData.password,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          alertsSent: data.user.alertsSent, // ✅ Store alerts count
        })
      );

      navigate("/dashboard"); // ✅ Redirects to dashboard
    } catch (error) {
      setError(
        error.response?.data?.message || "Login failed. Please try again."
      );
    }
  };

  // ✅ Handle Registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.emergencyContacts.length === 0) {
      setError("Please add at least one emergency contact.");
      return;
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        emergencyContacts: formData.emergencyContacts,
      });

      alert("Registration successful! Please log in.");
      navigate("/login"); // ✅ Redirects to login after registration
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed.");
    }
  };

  // ✅ Add Emergency Contact
  const addEmergencyContact = () => {
    if (!contact.name.trim() || !contact.phone.trim()) {
      setError("Both contact name and phone are required.");
      return;
    }

    if (!/^\d+$/.test(contact.phone)) {
      setError("Phone number must contain only digits.");
      return;
    }

    setFormData((prevData) => ({
      ...prevData,
      emergencyContacts: [...prevData.emergencyContacts, contact],
    }));

    setContact({ name: "", phone: "" });
    setError(null);
  };

  return (
    <div className="auth-container">
      <h2>{isLogin ? "Login" : "Register"}</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={isLogin ? handleLogin : handleRegister}>
        {!isLogin && (
          <>
            <input
              type="text"
              placeholder="Name"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <div>
              <input
                type="text"
                placeholder="Emergency Contact Name"
                value={contact.name}
                onChange={(e) =>
                  setContact({ ...contact, name: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Phone (Numbers Only)"
                value={contact.phone}
                onChange={(e) =>
                  setContact({ ...contact, phone: e.target.value })
                }
              />
              <button type="button" onClick={addEmergencyContact}>
                Add Contact
              </button>
            </div>
            {formData.emergencyContacts.length > 0 && (
              <ul>
                {formData.emergencyContacts.map((c, index) => (
                  <li key={index}>
                    {c.name} - {c.phone}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        <input
          type="email"
          placeholder="Email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />
        <button type="submit">{isLogin ? "Login" : "Register"}</button>
      </form>
    </div>
  );
};

export default Auth;
