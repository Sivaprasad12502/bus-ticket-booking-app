// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB_b8JBLaZlpS6qPo51CP8KoGC4XVylBOk",
  authDomain: "login-auth-da499.firebaseapp.com",
  projectId: "login-auth-da499",
  storageBucket: "login-auth-da499.firebasestorage.app",
  messagingSenderId: "976665168973",
  appId: "1:976665168973:web:ff59ddd1ff36b0c5282004"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth =getAuth(app)
export const googleProvider=new GoogleAuthProvider()