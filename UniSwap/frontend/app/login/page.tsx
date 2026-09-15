"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");
      localStorage.setItem("token", data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6 py-12 text-ink">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-lg border border-line bg-surface lg:grid-cols-2">
        {/* LEFT */}
        <div className="hidden bg-ink p-12 text-paper lg:flex lg:flex-col lg:justify-between">
          <div>
            <Image
              src="/uniswap-logo.png"
              alt="UniSwap"
              width={48}
              height={48}
              className="h-11 w-11 rounded-lg object-cover"
            />
            <h1 className="font-display mt-10 text-4xl font-medium leading-tight">
              Welcome back to
              <span className="block italic text-accent">UniSwap.</span>
            </h1>
            <p className="mt-6 max-w-md leading-7 text-paper/70">
              Buy, sell and swap useful items with students around your campus.
            </p>
          </div>
          <p className="text-sm text-paper/50">From students. For a better campus.</p>
        </div>

        {/* RIGHT */}
        <div className="p-8 sm:p-12">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <Image
              src="/uniswap-logo.png"
              alt="UniSwap"
              width={40}
              height={40}
              className="h-9 w-9 rounded-lg object-cover"
            />
            <span className="font-display text-xl font-medium">UniSwap</span>
          </div>

          <h2 className="font-display text-3xl font-medium">Sign in</h2>
          <p className="mt-2 text-ink-soft">Welcome back — enter your details to continue.</p>

          {error && (
            <div className="mt-6 rounded-md border border-danger/30 bg-danger-soft p-4 text-sm font-medium text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-soft">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-md border border-line px-4 py-3 text-sm outline-none transition focus:border-brand"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-soft">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-md border border-line px-4 py-3 text-sm outline-none transition focus:border-brand"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-brand py-3.5 font-semibold text-paper transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-ink-soft">
            Don't have an account?{" "}
            <Link href="/register" className="font-semibold text-brand hover:underline">
              Create one
            </Link>
          </p>
          <Link href="/" className="mt-6 block text-center text-sm font-medium text-ink-faint hover:text-brand">
            ← Back to UniSwap
          </Link>
        </div>
      </div>
    </main>
  );
}
