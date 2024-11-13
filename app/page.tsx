"use client";
import React, { useState } from "react";
import HeadContent from "./HeadContent";
import "../styles/App.css";
import { auth } from "./firebase-config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";

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
        window.location.href = "/login";
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
      <div className="sign-up-page">
        <h1 className="title">
          UPV <span>OATS</span>
        </h1>
        <div className="sign-up-container">
          <h2>Hello!</h2>
          <form id="signup-form" onSubmit={handleSignUp}>
            <div className="input-container">
              <i className="material-icons">person</i>
              <input
                className="input-field"
                type="text"
                placeholder="Username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="input-container">
              <i className="material-icons">mail</i>
              <input
                className="input-field"
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="input-container">
              <i className="material-icons">lock</i>
              <input
                className="input-field"
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
            Already have an account? <Link href="/login">Sign in now.</Link>{" "}
          </p>
        </div>
      </div>
    </>
  );
};

export default App;
