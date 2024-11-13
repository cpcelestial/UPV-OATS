// /app/login/page.tsx
"use client";
import React, { useState } from "react";
import HeadContent from "../HeadContent";
import { auth } from "../firebase-config";
import { signInWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import "../../styles/App.css";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("Logged in as:", user.email);
        localStorage.setItem("email", user.email);
        window.location.href = "/profile"; // Redirect page c/o kez/dale
      })
      .catch((error) => {
        alert("Login Failed: " + error.message);
      });
  };

  return (
    <>
      <HeadContent />
      <div className="login-page">
        <h1 className="title">
          UPV <span>OATS</span>
        </h1>
        <div className="login-container">
          <h2>Welcome!</h2>
          <form id="login-form" onSubmit={handleLogin}>
            <div className="input-container">
              <i className="material-icons">mail</i>
              <input
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
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit">Sign In</button>
          </form>
          <p>
            Don&apos;t have an account? <Link href="/signup">Sign up now.</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
