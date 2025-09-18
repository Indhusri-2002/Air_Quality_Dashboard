"use client";
import { useState } from "react";
import { useRouter } from "next/router";
import { saveToken, isLoggedIn } from "@/utils/auth";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  if (typeof window !== "undefined" && isLoggedIn()) {
    router.replace("/home");
  }

  async function handleSignup(e) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    try {
      const res = await fetch("http://localhost:3000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error("Signup failed");
      await res.json();
      // after signup -> login automatically
      const loginRes = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await loginRes.json();
      saveToken(data.accessToken);
      router.push("/home");
    } catch (err) {
      setError("Signup failed, try another email");
    }
  }

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <form className="p-4 border rounded" onSubmit={handleSignup}>
        <h3>Signup</h3>
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
        <input
          type="password"
          placeholder="Confirm Password"
          className="form-control my-2"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-primary w-100">Signup</button>
        <p className="mt-2">
          Already a user? <a href="/login">Login</a>
        </p>
      </form>
    </div>
  );
}
