import React, { useState, useEffect } from "react";

const KeyboardHint = ({ message }) => {
  const [visible, setVisible] = useState(false);
  const [displayMsg, setDisplayMsg] = useState("");

  useEffect(() => {
    if (message) {
      setDisplayMsg(message);
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "1.5rem",
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(0, 0, 0, 0.75)",
        color: "#fff",
        padding: "0.5rem 1.2rem",
        borderRadius: "6px",
        fontSize: "1rem",
        fontWeight: 500,
        letterSpacing: "0.03em",
        zIndex: 9999,
        pointerEvents: "none",
        animation: "hintFadeIn 0.15s ease-out",
      }}
    >
      {displayMsg}
    </div>
  );
};

export default KeyboardHint;
