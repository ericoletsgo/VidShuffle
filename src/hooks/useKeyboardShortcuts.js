import { useEffect } from "react";

export default function useKeyboardShortcuts(handlers) {
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (document.hidden) return;

      const prefix = e.ctrlKey || e.metaKey ? "ctrl+" : "";
      const fn = handlers[prefix + e.code] || handlers[prefix + e.key] || (!prefix && (handlers[e.code] || handlers[e.key]));
      if (fn) {
        e.preventDefault();
        fn();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [handlers]);
}
