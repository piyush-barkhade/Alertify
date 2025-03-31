import Auth from "./Auth.jsx";
import Navbar from "./Navbar.jsx"; // ✅ Import Navbar

const Register = () => {
  return (
    <>
      <Navbar /> {/* ✅ Show Navbar on Register Page */}
      <Auth isLogin={false} />
    </>
  );
};

export default Register;
