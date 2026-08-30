"use client";

import { useState } from "react";

export default function LoginUtilities() {
  const [dark, setDark] = useState(false);

  function toggleAppearance() {
    const panel = document.querySelector<HTMLElement>(".login-panel");
    if (!panel) return;
    setDark(prev => {
      const next = !prev;
      panel.classList.toggle("login-panel-dark", next);
      return next;
    });
  }

  return (
    <div className="login-utilities">
      <label className="login-utility login-utility-select">
        <svg className="login-utility-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <select className="login-utility-native" aria-label="Language">
          <option value="en">English</option>
        </select>
        <svg className="login-utility-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </label>

      <button
        type="button"
        className="login-utility login-utility-button"
        onClick={toggleAppearance}
        aria-label={dark ? "Switch to light appearance" : "Switch to dark appearance"}
      >
        {dark ? (
          <svg className="login-utility-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
          </svg>
        ) : (
          <svg className="login-utility-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" />
          </svg>
        )}
      </button>
    </div>
  );
}
