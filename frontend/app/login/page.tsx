"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import { saveToken } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await login(email, password);
      saveToken(result.access_token);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main>
      <div className="card" style={{ maxWidth: 460, margin: "64px auto" }}>
        <h1>Login</h1>
        <form onSubmit={onSubmit}>
          <div>
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div style={{ marginTop: 10 }}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button style={{ marginTop: 12 }} disabled={busy} type="submit">
            {busy ? "Signing in..." : "Login"}
          </button>
          {error ? <p className="error">{error}</p> : null}
        </form>
        <p className="muted" style={{ marginTop: 12 }}>
          No account? <Link href="/signup">Create one</Link>
        </p>
      </div>
    </main>
  );
}
