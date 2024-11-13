"use client";
import React, { useState } from "react";
import HeadContent from "./HeadContent";
import "./App.css";
import { auth } from "./firebase-config";
import { createUserWithEmailAndPassword } from "firebase/auth";

const App: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Form submission prevented. Starting user registration...");

    if (!email || !password) {
      alert("Email and password fields are required.");
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("User registered successfully:", user);
        alert("User registered successfully!");
        window.location.href = "Login.html";
      })
      .catch((error) => {
        const errorMessage = error.message;
        console.error(`Error: ${errorMessage}`);
        alert(`Error: ${errorMessage}`);
      });
  };

  return (
    <>
      <HeadContent />
      <body class="sign-up-page">
        <h1 class="title">
          UPV <span>OATS</span>
        </h1>
        <div class="sign-up-container">
          <h2>Hello!</h2>
          <form id="signup-form" onSubmit={handleSignUp}>
            <div class="input-container">
              <i class="material-icons">person</i>
              <input
                class="input-field"
                type="text"
                placeholder="Username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div class="input-container">
              <i class="material-icons">mail</i>
              <input
                class="input-field"
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div class="input-container">
              <i class="material-icons">lock</i>
              <input
                class="input-field"
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit">Sign Up</button>
          </form>
          <p>
            Already have an account? <a href="Login.html">Sign in now.</a>
          </p>
        </div>
      </body>
    </>
  );
};

export default App;
