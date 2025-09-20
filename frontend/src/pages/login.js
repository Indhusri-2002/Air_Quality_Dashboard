"use client";
import { useState } from "react";
import { useRouter } from "next/router";
import { saveToken, isLoggedIn } from "@/utils/auth";

const BACKEND_API_URL = process.env.BACKEND_API_URL;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (typeof window !== "undefined" && isLoggedIn()) {
    router.replace("/home"); // already logged in
  }

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${BACKEND_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error("Login failed");
      const data = await res.json();
      saveToken(data.accessToken);
      router.push("/home");
    } catch (err) {
      setError("Invalid email or password");
    }
  }

  return (
    <div className="login-bg">
      <form className="glass-card" onSubmit={handleLogin}>
        <h3>Login</h3>
        {error && <p className="error">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
        <p className="footer-text">
          New user? <a href="/signup">Signup</a>
        </p>
      </form>

      <style jsx>{`
        .login-bg {
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: url('/background.jpeg') no-repeat center center/cover;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 2rem;
          border-radius: 12px;
          width: 100%;
          max-width: 380px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
          text-align: center;
        }

        h3 {
          margin-bottom: 1rem;
          color: #0070f3;
        }

        input {
          width: 100%;
          padding: 10px;
          margin: 8px 0;
          border: none;
          border-radius: 6px;
          outline: none;
          font-size: 14px;
        }

        input:focus {
          border: 2px solid #0070f3;
        }

        button {
          width: 100%;
          padding: 10px;
          margin-top: 10px;
          background: #0070f3;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        button:hover {
          background: #0059c9;
        }

        .error {
          color: #ff4d4f;
          margin-bottom: 10px;
          font-size: 14px;
        }

        .footer-text {
          margin-top: 1rem;
          font-size: 14px;
          color: #fff;
        }

        .footer-text a {
          color: #fff;
          text-decoration: underline;
        }

        .footer-text a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
