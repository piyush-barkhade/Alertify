import Navbar from "../components/Navbar.jsx";
import "../styles/Home.css";
import Footer from "./Footer.jsx";

const Home = () => {
  return (
    <>
      <div className="home">
        <Navbar />

        <h1>Welcome to Alertify 🚨</h1>
        <p>Your safety, our priority.</p>
        <Footer />
      </div>
    </>
  );
};

export default Home;
