
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyBTcWxRiFCbMNk77lzgqwJHSSD_FE2RrzQ",
    authDomain: "game-sphere-bd-a9cd8.firebaseapp.com",
    databaseURL: "https://game-sphere-bd-a9cd8-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "game-sphere-bd-a9cd8",
    storageBucket: "game-sphere-bd-a9cd8.appspot.com",
    messagingSenderId: "782465918457",
    appId: "1:782465918457:web:4495f9e218015e096d8928",
    measurementId: "G-GJ9K47XLH2"
  };

  const app = initializeApp(firebaseConfig);
  export const db = getFirestore(app); // Export Firestore Database
  export const auth = getAuth(app); // Export Authentication
  export const storage = getStorage(app); // Export Storage  