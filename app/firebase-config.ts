import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCECy-aZ_k_f7_MRZYasrezbDVBPsLKE7M",
  authDomain: "oats-38392.firebaseapp.com",
  databaseURL:
    "https://oats-38392-default-rtdb.asia-southeast1.firebasedatabase.app",//unused rtdb
  projectId: "oats-38392",
  storageBucket: "oats-38392.appspot.com",
  messagingSenderId: "490235160932",
  appId: "1:490235160932:web:cff8ab708b9ab656ba3271",
  measurementId: "G-FZHT0C51LZ",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
