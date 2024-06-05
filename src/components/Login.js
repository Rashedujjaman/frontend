import React, { useState } from "react";
import { auth } from "../services/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

function Login({setIsAuthenticated}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState(null);
  // State to store error message
  const [loading, setLoading] = useState(false); // State to show loading
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    setLoading(true); // Show loading indicator
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setIsAuthenticated(true);

      // Assuming your protected route is '/dashboard'
      navigate("/dashboard"); // Navigate to the dashboard after successful login
    } catch (error) {
      // Handle errors, e.g., wrong credentials
      console.error("Error logging in:", error);
      setError(error.message);
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  return (
    <div className="login-form">
      <div className="heading">
      <h1>Login</h1>
      </div>
      <form onSubmit={handleLogin}>
        <div className="input-field">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="input-field">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="submit-button">
        <button type="submit" disabled={loading}>
          Login
        </button>
        </div>

        <div className="register-link">
          Don't have an account? <Link to="/register" className="register-btn">Register</Link>
        </div>
      </form>
    </div>
  );
}

export default Login;
