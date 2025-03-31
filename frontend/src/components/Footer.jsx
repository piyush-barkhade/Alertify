import React from "react";
import "../styles/Footer.css"; // Import the CSS for the Footer component

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <h2>Alertify</h2>
        <p>Keeping you safe, wherever you are.</p>
        <div className="footer-links">
          <a href="#">Home</a>
          <a href="#">About</a>
          <a href="#">Features</a>
          <a href="#">Contact</a>
        </div>
        <p className="footer-copyright">
          &copy; 2025 AlerƟfy. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
