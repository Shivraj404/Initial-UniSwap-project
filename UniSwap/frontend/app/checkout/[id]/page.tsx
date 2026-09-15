"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type Listing = {
  _id: string;
  title: string;
  price: number;
  images?: string[];
  category: string;
  condition?: string;
  location?: string;
  status?: string;
  seller?: { _id?: string; name?: string; college?: string };
};

export default function CheckoutPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);

  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        if (u.name) setBuyerName(u.name);
        if (u.phone) setBuyerPhone(u.phone);
      } catch {
        /* ignore */
      }
    }

    fetch(`${API_URL}/listings/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Listing not found");
        return res.json();
      })
      .then((data) => setListing(data.listing))
      .catch(() => setError("This listing couldn't be found — it may have been removed."))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlacing(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          listingId: id,
          buyerName,
          buyerPhone,
          deliveryAddress,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to place order");
      setPlaced(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper text-ink-soft">
        Loading…
      </main>
    );
  }

  if (placed && listing) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper px-6 py-12 text-ink">
        <div className="w-full max-w-md rounded-lg border border-line bg-surface p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-2xl text-brand">
            ✓
          </div>
          <h1 className="font-display mt-5 text-2xl font-medium">Order placed</h1>
          <p className="mt-2 text-sm leading-6 text-ink-soft">
            <strong>{listing.title}</strong> is reserved for you. Pay{" "}
            <strong>₹{listing.price}</strong> in cash when it's delivered or
            handed over on campus.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/orders"
              className="rounded-md bg-brand py-3 text-sm font-semibold text-paper transition hover:bg-brand-dark"
            >
              View my orders
            </Link>
            <Link
              href="/"
              className="rounded-md border border-line py-3 text-sm font-semibold text-ink-soft transition hover:border-brand hover:text-brand"
            >
              Back to marketplace
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (error && !listing) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper px-6 text-center text-ink">
        <div>
          <p className="text-ink-soft">{error}</p>
          <Link href="/" className="mt-4 inline-block font-semibold text-brand hover:underline">
            ← Back to marketplace
          </Link>
        </div>
      </main>
    );
  }

  if (!listing) return null;

  return (
    <main className="min-h-screen bg-paper px-6 py-12 text-ink">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm font-medium text-ink-faint hover:text-brand">
          ← Back to marketplace
        </Link>
        <h1 className="font-display mt-4 text-3xl font-medium">Checkout</h1>
        <p className="mt-2 text-ink-soft">
          Reserve this item now — pay cash when you collect it.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          {/* ORDER SUMMARY */}
          <div className="h-fit rounded-lg border border-line bg-surface p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">
              Order summary
            </p>
            <div className="mt-4 flex gap-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-line bg-paper">
                {listing.images && listing.images[0] ? (
                  <Image src={listing.images[0]} alt={listing.title} fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl">📦</div>
                )}
              </div>
              <div>
                <p className="font-medium leading-snug">{listing.title}</p>
                <p className="mt-1 text-sm text-ink-faint">
                  {listing.category}{listing.condition ? ` · ${listing.condition}` : ""}
                </p>
                {listing.seller?.name && (
                  <p className="mt-1 text-sm text-ink-faint">Sold by {listing.seller.name}</p>
                )}
              </div>
            </div>

            <div className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
              <div className="flex justify-between text-ink-soft">
                <span>Item price</span>
                <span>₹{listing.price}</span>
              </div>
              <div className="flex justify-between text-ink-soft">
                <span>Delivery / pickup fee</span>
                <span>₹0</span>
              </div>
              <div className="flex justify-between border-t border-line pt-2 font-display text-lg font-semibold">
                <span>Total (pay on delivery)</span>
                <span>₹{listing.price}</span>
              </div>
            </div>

            <div className="mt-5 rounded-md bg-brand-soft p-3 text-xs font-medium text-brand">
              💵 Cash on Delivery — the only payment method on UniSwap. No online
              payment is collected.
            </div>
          </div>

          {/* DELIVERY DETAILS FORM */}
          <form onSubmit={handlePlaceOrder} className="rounded-lg border border-line bg-surface p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">
              Delivery / pickup details
            </p>

            {error && (
              <div className="mt-4 rounded-md border border-danger/30 bg-danger-soft p-3 text-sm font-medium text-danger">
                {error}
              </div>
            )}

            <div className="mt-4 space-y-4">
              <Field label="Your name">
                <input
                  required
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Mobile number">
                <input
                  type="tel"
                  required
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="98765 43210"
                  className={inputClass}
                />
              </Field>
              <Field label="Delivery address / preferred pickup spot">
                <textarea
                  required
                  rows={3}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="e.g. Hostel Block C, Room 204 — or a campus landmark to meet at"
                  className={inputClass}
                />
              </Field>
              <Field label="Notes for the seller (optional)">
                <input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Preferred time to meet, etc."
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="mt-5 flex items-center gap-2 rounded-md border border-line p-3">
              <input type="radio" checked readOnly className="accent-brand" />
              <span className="text-sm font-medium text-ink">Cash on Delivery (COD)</span>
            </div>

            <button
              type="submit"
              disabled={placing}
              className="mt-6 w-full rounded-md bg-brand py-3.5 font-semibold text-paper transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {placing ? "Placing order…" : `Place order · Pay ₹${listing.price} on delivery`}
            </button>
          </form>
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
