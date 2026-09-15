"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Must match backend models/Listing.js enums exactly
const CATEGORIES = ["Books", "Electronics", "Furniture", "Stationery", "Clothing", "Other"];
const CONDITIONS = ["New", "Like New", "Good", "Fair", "Used"];
const MAX_IMAGES = 5;

type PreviewImage = { file: File; url: string };

export default function SellPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [images, setImages] = useState<PreviewImage[]>([]);
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    setCheckingAuth(false);

    // Pre-fill phone/location from the saved profile if we already have one
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        if (u.phone) setPhone(u.phone);
      } catch {
        /* ignore malformed cache */
      }
    }
  }, [router]);

  // Revoke object URLs on unmount to avoid leaking memory
  useEffect(() => {
    return () => images.forEach((img) => URL.revokeObjectURL(img.url));
  }, [images]);

  const handleFilesSelected = (fileList: FileList | null) => {
    if (!fileList) return;
    const incoming = Array.from(fileList).slice(0, MAX_IMAGES - images.length);
    const withPreviews = incoming.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...withPreviews].slice(0, MAX_IMAGES));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const payload = new FormData();
    payload.append("title", String(form.get("title") || ""));
    payload.append("description", String(form.get("description") || ""));
    payload.append("price", String(form.get("price") || ""));
    payload.append("category", String(form.get("category") || ""));
    payload.append("condition", String(form.get("condition") || ""));
    payload.append("location", location);
    payload.append("phone", phone);
    images.forEach((img) => payload.append("images", img.file));

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/listings`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }, // no Content-Type — browser sets the multipart boundary
        body: payload,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create listing");

      // Keep the cached profile in sync with the phone number we just saved
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          const u = JSON.parse(stored);
          localStorage.setItem("user", JSON.stringify({ ...u, phone }));
        } catch {
          /* ignore malformed cache */
        }
      }

      setSuccess(true);
      setTimeout(() => router.push("/"), 1200);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) return null;

  return (
    <main className="min-h-screen bg-paper px-6 py-12 text-ink">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm font-medium text-ink-faint hover:text-brand">
          ← Back to marketplace
        </Link>

        <h1 className="font-display mt-4 text-3xl font-medium">List an item</h1>
        <p className="mt-2 text-ink-soft">
          Give details buyers will actually want to know — condition, pickup location, and a clear price.
        </p>

        {success && (
          <div className="mt-6 rounded-md border border-brand/30 bg-brand-soft p-4 text-sm font-medium text-brand">
            Listing created — redirecting to the marketplace…
          </div>
        )}
        {error && (
          <div className="mt-6 rounded-md border border-danger/30 bg-danger-soft p-4 text-sm font-medium text-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {/* PHOTOS */}
          <Field label={`Photos (up to ${MAX_IMAGES})`}>
            <div className="grid grid-cols-5 gap-3">
              {images.map((img, i) => (
                <div key={img.url} className="relative aspect-square overflow-hidden rounded-md border border-line">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink/80 text-xs text-paper"
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}
              {images.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex aspect-square flex-col items-center justify-center gap-1 rounded-md border border-dashed border-line text-ink-faint transition hover:border-brand hover:text-brand"
                >
                  <span className="text-xl leading-none">+</span>
                  <span className="text-[11px]">Add</span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFilesSelected(e.target.files)}
            />
            <p className="!mt-2 text-xs text-ink-faint">
              At least one photo helps buyers trust the listing. JPG, PNG, WEBP or GIF, up to 5MB each.
            </p>
          </Field>

          <Field label="Title">
            <input name="title" required placeholder="e.g. Engineering Mathematics, 3rd edition" className={inputClass} />
          </Field>

          <Field label="Description">
            <textarea name="description" required rows={4} placeholder="Condition, how long you've used it, anything a buyer should know" className={inputClass} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <select name="category" required className={inputClass}>
                <option value="">Select…</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Condition">
              <select name="condition" required className={inputClass}>
                <option value="">Select…</option>
                {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Price (₹)">
            <input name="price" type="number" min="0" required className={inputClass} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Contact mobile number" required>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="98765 43210"
                className={inputClass}
              />
            </Field>
            <Field label="Pickup location" required>
              <input
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Hostel Block B"
                className={inputClass}
              />
            </Field>
          </div>
          <p className="!mt-1 text-xs text-ink-faint">
            Your mobile number is shown to buyers on this listing and saved to your profile for future listings.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-brand py-3.5 font-semibold text-paper transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Publishing…" : "Publish listing"}
          </button>
        </form>
      </div>
    </main>
  );
}

const inputClass =
  "w-full rounded-md border border-line bg-surface px-4 py-3 text-sm outline-none transition focus:border-brand";

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-soft">
        {label}
        {required && <span className="text-danger"> *</span>}
      </span>
      {children}
    </label>
  );
}
