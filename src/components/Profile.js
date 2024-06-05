import React, { useState, useEffect } from "react";
import { auth, db, storage } from "../services/firebase";
import { updateProfile } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "./Profile.css";

function Profile() {
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null); // State to show success message

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userDoc = await getDoc(doc(db, "admin", currentUser.uid));
          const profilePictureUrl = userDoc.data()?.imageUrl;
          if (profilePictureUrl) {
            setImageUrl(profilePictureUrl);
          }
          setUser(userDoc.data());
          setFullName(userDoc.data().fullName || "");
          setMobile(userDoc.data().mobile || "");
          setEmail(currentUser.email);
        } else {
          // Handle case where user is not logged in (e.g., redirect to login)
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setError("Failed to fetch profile data. Please try again.");
        setImageUrl(null);
      }
    };

    fetchUserProfile();
  }, []);

  const handleImageChange = async (e) => {
    if (e.target.files[0]) {
      const selectedImage = e.target.files[0];
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const storageRef = ref(storage, `profileImages/${currentUser.uid}`);
          await uploadBytes(storageRef, selectedImage);
          const downloadURL = await getDownloadURL(storageRef);
          await updateProfile(currentUser, { photoURL: downloadURL });
          await updateDoc(doc(db, "admin", currentUser.uid), {
            imageUrl: downloadURL,
          });
          setImageUrl(downloadURL); // Update state immediately after upload
          setSuccessMessage("Profile picture updated successfully!");
        }
      } catch (error) {
        console.error("Error updating profile picture:", error);
        setError("Failed to update profile picture. Please try again.");
      }
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await updateProfile(currentUser, { displayName: fullName });
        await updateDoc(doc(db, "admin", currentUser.uid), {
          fullName,
          mobile,
        });

        // Optionally, display a success message
        setSuccessMessage("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile. Please try again.");
    }
  };

  return (
    <div className="profile-container">
      <h2>My Profile</h2>

      {/* Display error or success message */}
      {error && <p className="error-message">{error}</p>}
      

      {user && (
        <div className="profile-content">
            {successMessage && <p className="success-message">{successMessage}</p>}
          <div className="profile-photo" onClick={() => document.getElementById('imageUpload').click()}>
            <img src={imageUrl || "https://via.placeholder.com/150"} alt="Admin" />
            <label htmlFor="imageUpload" className="upload-button">
              Change Photo
            </label>
            <input
              type="file"
              id="imageUpload"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }} // Hide the default input element
            />
          </div>

          <form onSubmit={handleUpdateProfile}>
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
              <label htmlFor="email">Email:</label>
              <input type="email" id="email" value={email} disabled />
            </div>
            <div className="update-btn">
            <button type="submit">Update Profile</button>
            </div>
            
          </form>
        </div>
      )}
    </div>
  );
}

export default Profile;
