import React from "react";

const shortcuts = [
  ["Space", "Play / Pause"],
  ["←", "Previous song"],
  ["→", "Next song"],
  ["↑", "Volume up"],
  ["↓", "Volume down"],
  ["S", "Toggle shuffle"],
  ["M", "Toggle mute"],
  ["R", "Toggle repeat"],
  ["F", "Fullscreen"],
  ["Ctrl+←", "Seek back 5s"],
  ["Ctrl+→", "Seek forward 5s"],
  ["?", "Show shortcuts"],
];

const ShortcutsHelp = ({ visible, onClose }) => {
  if (!visible) return null;

  return (
    <div className="shortcutsOverlay" onClick={onClose}>
      <div className="shortcutsPanel" onClick={(e) => e.stopPropagation()}>
        <h3>Keyboard Shortcuts</h3>
        <ul className="shortcutsList">
          {shortcuts.map(([key, desc]) => (
            <li key={key}>
              <kbd>{key}</kbd>
              <span>{desc}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ShortcutsHelp;
