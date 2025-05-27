import React from "react";
import { AiFillYoutube } from "react-icons/ai";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <nav className="navbar">
      <div className="navBrand" onClick={() => navigate("/")}>
        <AiFillYoutube className="navIcon" />
        <span>VidShuffle</span>
      </div>
      {!isHome && (
        <button className="navHomeBtn" onClick={() => navigate("/")}>
          Home
        </button>
      )}
    </nav>
  );
};

export default Navbar;
