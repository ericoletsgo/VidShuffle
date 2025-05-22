import { Route, Routes } from "react-router-dom";
import "./css/index.css";
import Home from "./components/Home";
import Playlist from "./components/Playlist";
import ThemeToggle from "./components/ThemeToggle";

function App() {
  return (
    <div className="App">
      <ThemeToggle />
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path="/playlist/:id" element={<Playlist />} />
        <Route path="*" element={<h1>Error 404</h1>} />
      </Routes>
    </div>
  );
}

export default App;
