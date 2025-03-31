import Navbar from "../components/Navbar.jsx";
import "../styles/Home.css";
import Footer from "./Footer.jsx";

const Home = () => {
  return (
    <>
      <div className="home">
        <Navbar />

        <h1>Welcome to AlerƟfy 🚨</h1>
        <p>Your safety, our priority.</p>
      </div>
      <Footer />
    </>
  );
};

export default Home;
