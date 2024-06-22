import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Customers from "./components/Customers";
import Products from "./components/Products";
import Profile from "./components/Profile";
import Navbar from "./components/Navbar";
import Orders from "./components/Orders";
import Report from "./components/Report.jsx";
import { auth } from "./services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { signOut } from "firebase/auth";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    });
    return unsubscribe;
  }, [isAuthenticated]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsAuthenticated(false);
      // Redirect to the login page or any other appropriate page
      // You can use the navigate function from react-router-dom if needed
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <Router>
      <div>
        <Navbar
          isAuthenticated={isAuthenticated}
          handleLogout={handleLogout} // Pass handleLogout as prop
        />
        <Routes>
        <Route index element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
          <Route
            path="/login"
            element={
              <Login
                isAuthenticated={isAuthenticated}
                setIsAuthenticated={setIsAuthenticated}
              />
            }
          />
          <Route
            path="/register"
            element={<Register setIsAuthenticated={setIsAuthenticated} />}
          />
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />
            }
          />
          <Route path="/profile" element={<Profile/>} />
          <Route path="/products" element={<Products/>} />
          <Route path="/customers" element={<Customers/>} />
          <Route path="/orders" element={<Orders/>}/>
          <Route path="/report" element={<Report/>}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
