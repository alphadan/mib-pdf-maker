// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAjD_e-2w8dwtpruooiSanL8b3z0MG3wDA",
  authDomain: "mib-pdf-maker.firebaseapp.com",
  projectId: "mib-pdf-maker",
  storageBucket: "mib-pdf-maker.firebasestorage.app",
  messagingSenderId: "168190060940",
  appId: "1:168190060940:web:7363217ccc6d4b03978ea9"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication (ready for your login flow)
export const auth = getAuth(app);
