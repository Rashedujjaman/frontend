import React, { useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import "./ForgetPassword.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";


const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = getAuth();
  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true); // Start loading state
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent successfully!");
      setEmail("");
        navigate("/login");
    } catch (error) {
      toast.error("Error sending reset email. Please check your email and try again.");
      console.error(error);
    } finally {
      setLoading(false); // End loading state
    }
  };

  return (
    <div className="form-container">
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Enter registered email to get recovery link:</label>
        <input
          type="email"
          id="email"
          placeholder="example@domain.com"
          value={email}
          onChange={handleEmailChange}
          required
        />
        <button className="reset-btn" type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Mail"} 
        </button> 
      </form>
    </div>
  );
};

export default ForgetPassword;
