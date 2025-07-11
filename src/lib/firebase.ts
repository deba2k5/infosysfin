import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAUckN1eDSwYTozKPySR1WT26ZX6aYWd5I",
  authDomain: "krishisure.firebaseapp.com",
  projectId: "krishisure",
  storageBucket: "krishisure.firebasestorage.app",
  messagingSenderId: "20827926593",
  appId: "1:20827926593:web:ee54a7b42bf31289a316c0",
  measurementId: "G-W1SJC387VG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;