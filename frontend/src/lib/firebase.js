import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCAOU8hQltoYfCvNHebtun_Nkg0ybCuv2Q",
  authDomain: "guruuse123.firebaseapp.com",
  projectId: "guruuse123",
  storageBucket: "guruuse123.firebasestorage.app",
  messagingSenderId: "47138934719",
  appId: "1:47138934719:web:a83e48dcc6608c64ef9b0a",
  measurementId: "G-YDZHTCWMWE"
};

const app = initializeApp(firebaseConfig);

// Initialize Analytics (optional but matches your provided code)
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

// Auth exports for the rest of the application
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
