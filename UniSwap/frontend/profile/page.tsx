"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type User = {
  name?: string;
  email?: string;
  college?: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }

    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/";
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-sm font-semibold text-slate-500">
          Loading profile...
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-4xl">
            👤
          </div>

          <h1 className="mt-5 text-2xl font-black text-slate-900">
            You're not logged in
          </h1>

          <p className="mt-2 text-slate-500">
            Log in to view your UniSwap profile.
          </p>

          <Link
            href="/login"
            className="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700"
          >
            Log in
          </Link>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">

      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <Link
            href="/"
            className="text-xl font-black tracking-tight text-slate-900"
          >
            Uni<span className="text-blue-600">Swap</span>
          </Link>

          <Link
            href="/"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            ← Marketplace
          </Link>

        </div>
      </header>


      {/* PROFILE */}
      <div className="mx-auto max-w-5xl px-6 py-12">

        {/* PROFILE HERO */}
        <section className="overflow-hidden rounded-3xl bg-white shadow-sm">

          <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

          <div className="px-6 pb-8 sm:px-10">

            <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

              <div className="flex items-end gap-5">

                <div className="flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-white bg-blue-100 text-5xl shadow-lg">
                  👤
                </div>

                <div className="pb-1">

                  <h1 className="text-2xl font-black text-slate-900">
                    {user.name || "Student"}
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    UniSwap Student
                  </p>

                </div>

              </div>

              <button
                onClick={handleLogout}
                className="rounded-xl border border-red-200 px-5 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
              >
                Logout
              </button>

            </div>

          </div>

        </section>


        {/* INFORMATION */}
        <section className="mt-6 grid gap-6 md:grid-cols-2">

          {/* PERSONAL INFORMATION */}
          <div className="rounded-3xl bg-white p-7 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-black uppercase tracking-widest text-blue-600">
                  Account
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-900">
                  Personal Information
                </h2>
              </div>

              <span className="rounded-xl bg-blue-50 px-3 py-2 text-xl">
                👤
              </span>

            </div>

            <div className="mt-6 space-y-5">

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Name
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {user.name || "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Email
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {user.email || "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  College
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {user.college || "Not provided"}
                </p>
              </div>

            </div>

          </div>


          {/* QUICK ACTIONS */}
          <div className="rounded-3xl bg-white p-7 shadow-sm">

            <p className="text-xs font-black uppercase tracking-widest text-purple-600">
              UniSwap
            </p>

            <h2 className="mt-1 text-xl font-black text-slate-900">
              Quick Actions
            </h2>

            <div className="mt-6 space-y-3">

              <Link
                href="/sell"
                className="flex items-center gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-blue-300 hover:bg-blue-50"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-xl">
                  📦
                </span>

                <div>
                  <p className="font-bold text-slate-900">
                    Sell an item
                  </p>

                  <p className="text-sm text-slate-500">
                    List something for students
                  </p>
                </div>

                <span className="ml-auto text-slate-400">
                  →
                </span>
              </Link>


              <Link
                href="/"
                className="flex items-center gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-purple-300 hover:bg-purple-50"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-xl">
                  🔎
                </span>

                <div>
                  <p className="font-bold text-slate-900">
                    Browse Marketplace
                  </p>

                  <p className="text-sm text-slate-500">
                    Find items from students
                  </p>
                </div>

                <span className="ml-auto text-slate-400">
                  →
                </span>
              </Link>

            </div>

          </div>

        </section>


        {/* MY ACTIVITY */}
        <section className="mt-6 rounded-3xl bg-white p-7 shadow-sm">

          <p className="text-xs font-black uppercase tracking-widest text-blue-600">
            Activity
          </p>

          <h2 className="mt-1 text-xl font-black text-slate-900">
            My UniSwap Activity
          </h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-3xl font-black text-slate-900">
                0
              </p>

              <p className="mt-1 text-sm text-slate-500">
                My Listings
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-3xl font-black text-slate-900">
                0
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Saved Items
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-3xl font-black text-slate-900">
                0
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Transactions
              </p>
            </div>

          </div>

        </section>

      </div>

    </main>
  );
}