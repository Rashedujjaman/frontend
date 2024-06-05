import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar({ isAuthenticated, handleLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="navbar">
      <ul>
        <li>
          <h2>GameSphere BD</h2>
        </li>
        {/* Conditionally render links based on authentication and current location */}
        {/* {!isAuthenticated && location.pathname !== "/login" && location.pathname !== "/register" && (
          <li>
            <Link to="/login">Login</Link>
          </li>
        )} */}
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

