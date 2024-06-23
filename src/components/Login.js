import React, { useState } from "react";
import { auth } from "../services/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

function Login({ setIsAuthenticated }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setIsAuthenticated(true);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error: ", error); // Log the error object
      handleFirebaseError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFirebaseError = (error) => {
    if (error && error.code) {
      switch (error.code) {
        case "auth/user-not-found":
          setError("No user found with this email.");
          break;
        case "auth/wrong-password":
          setError("Incorrect password.");
          break;
        case "auth/invalid-email":
          setError("Invalid email format.");
          break;
        case "auth/user-disabled":
          setError("This user has been disabled.");
          break;
        case "auth/invalid-credential":
          setError("Invalid credentials provided.");
          break;
        case "auth/too-many-requests":
          setError("Too many requests. Please try again later.");
          break;
        default:
          setError(`Unexpected error: ${error.message}`);
          break;
      }
    } else {
      setError("An unexpected error occurred. Please try again.");
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
        {error && <div className="error-message">{error}</div>}
        <div className="submit-button">
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
        <div className="register-link">
          Don't have an account? <Link to="/register" className="register-btn">Register</Link>
        </div>
        <div className="forgot-password">
          <Link className="forgot-password-btn" to="/forgot-password">Forgot password?</Link>
        </div>
      </form>
    </div>
  );
}

export default Login;
