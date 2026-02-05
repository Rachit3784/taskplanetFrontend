import React from "react";
import "./Loading.css";

export default function Loading() {
  return (
    <div className="loading-screen">
      <div className="loader-wrapper">
        <div className="gold-ring"></div>
        <div className="gold-ring ring-2"></div>
        <div className="brand-text">
          <span className="brand-main">TASKPLANET</span>
          <span className="brand-sub">Loading Experience</span>
        </div>
      </div>
    </div>
  );
}
