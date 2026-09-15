"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const CATEGORIES = ["Books", "Electronics", "Furniture", "Stationery", "Clothing", "Other"];

type ItemRequest = {
  _id: string;
  title: string;
  description: string;
  category: string;
  budget?: number;
  createdAt: string;
  buyer?: { name?: string; phone?: string; college?: string };
};

export default function RequestItemPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<ItemRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const loadRequests = () => {
    setLoading(true);
    fetch(`${API_URL}/requests`)
      .then((res) => res.json())
      .then((data) => setRequests(data.requests || []))
      .finally(() => setLoading(false));
  };

  useEffect(loadRequests, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setPosting(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const budget = form.get("budget");

    try {
      const res = await fetch(`${API_URL}/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: form.get("title"),
          description: form.get("description"),
          category: form.get("category"),
          budget: budget ? Number(budget) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to post request");
      setSuccess(true);
      setShowForm(false);
      (e.target as HTMLFormElement).reset();
      loadRequests();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setPosting(false);
    }
  };

  return (
    <main className="min-h-screen bg-paper px-6 py-12 text-ink">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm font-medium text-ink-faint hover:text-brand">
          ← Back to marketplace
        </Link>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
              Can't find it?
            </p>
            <h1 className="font-display mt-2 text-3xl font-medium">Request an item</h1>
            <p className="mt-2 max-w-lg text-ink-soft">
              Post what you're looking for — sellers on campus who have it can reach out to you directly.
            </p>
          </div>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="w-fit rounded-md bg-brand px-6 py-3 text-sm font-semibold text-paper transition hover:bg-brand-dark"
          >
            {showForm ? "Cancel" : "+ Post a request"}
          </button>
        </div>

        {success && (
          <div className="mt-6 rounded-md border border-brand/30 bg-brand-soft p-4 text-sm font-medium text-brand">
            Request posted — sellers can now see it below.
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-lg border border-line bg-surface p-6">
            {error && (
              <div className="rounded-md border border-danger/30 bg-danger-soft p-3 text-sm font-medium text-danger">
                {error}
              </div>
            )}
            <Field label="What are you looking for?">
              <input name="title" required placeholder="e.g. Scientific calculator, FX-991" className={inputClass} />
            </Field>
            <Field label="Details">
              <textarea name="description" required rows={3} placeholder="Any specific model, condition, or timeframe" className={inputClass} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Category">
                <select name="category" required className={inputClass}>
                  <option value="">Select…</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Budget (₹, optional)">
                <input name="budget" type="number" min="0" className={inputClass} />
              </Field>
            </div>
            <button
              type="submit"
              disabled={posting}
              className="rounded-md bg-brand px-6 py-2.5 text-sm font-semibold text-paper transition hover:bg-brand-dark disabled:opacity-60"
            >
              {posting ? "Posting…" : "Post request"}
            </button>
          </form>
        )}

        <div className="mt-10">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Open requests</p>
          <h2 className="font-display mt-1 text-2xl font-medium">What students are looking for</h2>

          <div className="mt-6 space-y-4">
            {loading ? (
              <p className="text-ink-faint">Loading requests…</p>
            ) : requests.length === 0 ? (
              <div className="rounded-lg border border-dashed border-line bg-surface px-6 py-14 text-center">
                <h3 className="font-display text-lg font-medium">No open requests</h3>
                <p className="mt-2 text-sm text-ink-soft">Be the first to post one.</p>
              </div>
            ) : (
              requests.map((r) => (
                <div key={r._id} className="rounded-lg border border-line bg-surface p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <span className="rounded-full border border-line px-2.5 py-1 text-xs font-medium text-ink-soft">
                        {r.category}
                      </span>
                      <h3 className="font-display mt-2 text-lg font-medium">{r.title}</h3>
                      <p className="mt-1 text-sm text-ink-soft">{r.description}</p>
                    </div>
                    {r.budget && (
                      <span className="font-display text-lg font-semibold text-brand">
                        ₹{r.budget}
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3 text-sm text-ink-faint">
                    <span>
                      Requested by {r.buyer?.name || "a student"}
                      {r.buyer?.college ? ` · ${r.buyer.college}` : ""}
                    </span>
                    {r.buyer?.phone && (
                      <a href={`tel:${r.buyer.phone}`} className="font-semibold text-brand hover:underline">
                        Call {r.buyer.phone}
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

const inputClass =
  "w-full rounded-md border border-line bg-paper px-4 py-2.5 text-sm outline-none transition focus:border-brand";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-soft">{label}</span>
      {children}
    </label>
  );
}
