"use client";
import { useState } from "react";
import { useRouter } from "next/router";
import { saveToken, isLoggedIn } from "@/utils/auth";

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
      const res = await fetch("http://localhost:3000/auth/login", {
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
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <form className="p-4 border rounded" onSubmit={handleLogin}>
        <h3>Login</h3>
        {error && <p className="text-danger">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          className="form-control my-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="form-control my-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-primary w-100">Login</button>
        <p className="mt-2">
          New user? <a href="/signup">Signup</a>
        </p>
      </form>
    </div>
  );
}
