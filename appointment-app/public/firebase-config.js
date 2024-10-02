import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCECy-aZ_k_f7_MRZYasrezbDVBPsLKE7M",
  authDomain: "oats-38392.firebaseapp.com",
  databaseURL:
    "https://oats-38392-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "oats-38392",
  storageBucket: "oats-38392.appspot.com",
  messagingSenderId: "490235160932",
  appId: "1:490235160932:web:cff8ab708b9ab656ba3271",
  measurementId: "G-FZHT0C51LZ",
};

// Initialize Firebase and authrntication
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
