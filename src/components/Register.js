import React, { useState, useEffect } from "react";
import { auth, db } from "../services/firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { collection,doc, setDoc, query, where, getDocs } from "firebase/firestore";
import "./Register.css";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [surname, setSurname] = useState("");
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginMessage, setShowLoginMessage] = useState(false);

  useEffect(() => {
    // Check authentication state when component mounts
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        setShowLoginMessage(true);
      } else {
        setIsLoggedIn(false);
        setShowLoginMessage(false);
      }
    });
    return unsubscribe; // Clean up the listener when the component unmounts
  }, []);

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      alert("Invalid email address.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      // Check if the email address is already in use
      const existingUser = await fetchUserByEmail(email);
      if (existingUser) {
        alert("Email address is already in use. Please log in.");
        return;
      }

      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Update user profile with additional information
      await updateProfile(user, {
        displayName: fullName,
      });

      // Store user data in Firestore with UID as document ID
      await setDoc(doc(db, "admin", user.uid), {
        uid: user.uid,
        email,
        surname,
        fullName,
        mobile,
      });


      console.log("User added to Firestore with ID:", user.uid);

      navigate("/dashboard");
    } catch (error) {
      // Handle registration errors
      console.error("Error during registration:", error);
    }
  };

  const fetchUserByEmail = async (email) => {
    try {
      // Query Firestore to find a user with the given email
      const usersRef = collection(db, "admin");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // No user found with the given email
        return null;
      }

      // Return the first user found (assuming unique emails)
      const userDoc = querySnapshot.docs[0];
      return userDoc.data(); // Adjust this based on your data structure
    } catch (error) {
      console.error("Error fetching user by email:", error);
      return null; // Handle the error appropriately (e.g., show an error message)
    }
  };

  return (
    <div className="register-form">

      {/* Render the registration form if not logged in */}
      {!isLoggedIn && (
        <form onSubmit={handleRegister}>
          <div className="heading">
            <h1>Register</h1>
          </div>
          <div className="input-field">
            <label htmlFor="surname">Surname:</label>
            <input
              type="text"
              id="surname"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              required
            />
          </div>
          <div className="input-field">
            <label htmlFor="fullName">Full Name:</label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="input-field">
            <label htmlFor="email">Email Address:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-field">
            <label htmlFor="mobile">Mobile:</label>
            <input
              type="tel"
              id="mobile"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
            />
          </div>
          <div className="input-field">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="input-field">
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div className="submit-button">
            <button type="submit">Register</button>
          </div>

          <div className="login-link">
            Don't have an account?{" "}
            <Link to="/login" className="login-btn">
              Login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

export default Register;
