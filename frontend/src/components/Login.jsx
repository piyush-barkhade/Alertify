import Auth from "../components/Auth";
import Navbar from "../components/Navbar"; // ✅ Import Navbar

const Login = () => {
  return (
    <>
      <Navbar /> {/* ✅ Show Navbar on Login Page */}
      <Auth isLogin={true} />
    </>
  );
};

export default Login;
