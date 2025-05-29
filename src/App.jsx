import { Route, Routes } from "react-router-dom";
import "./css/index.css";
import Home from "./components/Home";
import Navbar from "./components/Navbar";
import NotFound from "./components/NotFound";
import Playlist from "./components/Playlist";
import ThemeToggle from "./components/ThemeToggle";

function App() {
  return (
    <div className="App">
      <Navbar />
      <ThemeToggle />
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path="/playlist/:id" element={<Playlist />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
