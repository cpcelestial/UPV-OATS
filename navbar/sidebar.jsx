import React from 'react';
import 'styles./global.css'; 
import logoImage from './logo-image-1.png'; 

function Sidebar() {
  return (
    <div className="sidebar" id="sidebar">
      <div className="logo">
        <img src={logoImage} alt="OATS Logo" className="logo-image" />
        <h1 className="fira-sans-black">
          <span className="primary-color">UPV</span>
          <span className="secondary-color">OATS</span>
        </h1>
      </div>
      <ul className="menu karla-semibold">
        <li>
          <span className="material-icons active">dashboard</span>
          <a href="#dashboard" className="active-page">Dashboard</a>
        </li>
        <li>
          <span className="material-icons">calendar_today</span>
          <a href="#calendar">Calendar</a>
        </li>
        <li>
          <span className="material-icons">groups</span>
          <a href="#faculty">Faculty</a>
        </li>
        <li>
          <span className="material-icons">account_circle</span>
          <a href="#profile">Profile</a>
        </li>
      </ul>
      <div className="logout">
        <li>
          <span className="material-icons">logout</span>
          <a href="#logout">Logout</a>
        </li>
      </div>
    </div>
  );
}

export default Sidebar;
