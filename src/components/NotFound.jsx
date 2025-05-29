import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="notFound">
      <h1>404</h1>
      <p className="notFoundText">This page doesn't exist</p>
      <button className="submitBtn" onClick={() => navigate("/")}>
        Go Home
      </button>
    </div>
  );
};

export default NotFound;
