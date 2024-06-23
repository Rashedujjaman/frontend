import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar({ isAuthenticated, handleLogout }) {

  return (
    <nav className="navbar">
      <ul>
        <li>
          <h2>GameSphere BD Admin</h2>
        </li>
        {isAuthenticated && ( // Show Dashboard and Logout when authenticated
          <>
            <li>
              <Link to="/dashboard">Dashboard</Link>
            </li>
            <li>
              <Link to="/products">Products</Link>
            </li>
            <li>
              <Link to="/orders">Orders</Link>
            </li>
            <li>
              <Link to="/report">Report</Link>
            </li>
            <li>
              <Link to="/customers">Customers</Link>
            </li>
            <li>
              <Link to="/profile">Profile</Link>
            </li>
            <li>
              <button onClick={handleLogout}>Logout</button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
export default Navbar;
