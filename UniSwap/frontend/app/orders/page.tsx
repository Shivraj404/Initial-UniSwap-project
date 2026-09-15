"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type Order = {
  _id: string;
  itemTitle: string;
  amount: number;
  status: "pending" | "confirmed" | "delivered" | "cancelled";
  buyerName: string;
  buyerPhone: string;
  deliveryAddress: string;
  notes?: string;
  createdAt: string;
  listing?: { title?: string; images?: string[] };
  seller?: { name?: string; phone?: string; college?: string };
  buyer?: { name?: string; phone?: string };
};

const statusStyles: Record<string, string> = {
  pending: "bg-accent-soft text-accent",
  confirmed: "bg-brand-soft text-brand",
  delivered: "bg-brand text-paper",
  cancelled: "bg-danger-soft text-danger",
};

export default function OrdersPage() {
  return (
    <Suspense fallback={null}>
      <OrdersPageInner />
    </Suspense>
  );
}

function OrdersPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"buying" | "selling">(
    searchParams.get("tab") === "selling" ? "selling" : "buying"
  );
  const [buying, setBuying] = useState<Order[]>([]);
  const [selling, setSelling] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadOrders = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    setLoading(true);
    Promise.all([
      fetch(`${API_URL}/orders/my`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${API_URL}/orders/selling`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ])
      .then(([mine, theirs]) => {
        setBuying(mine.orders || []);
        setSelling(theirs.orders || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(loadOrders, [router]);

  const updateStatus = async (orderId: string, status: string) => {
    setUpdatingId(orderId);
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      loadOrders();
    } finally {
      setUpdatingId(null);
    }
  };

  const list = tab === "buying" ? buying : selling;

  return (
    <main className="min-h-screen bg-paper px-6 py-12 text-ink">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm font-medium text-ink-faint hover:text-brand">
          ← Back to marketplace
        </Link>
        <h1 className="font-display mt-4 text-3xl font-medium">My orders</h1>
        <p className="mt-2 text-ink-soft">Track items you've ordered and items you're selling.</p>

        <div className="mt-6 flex gap-2 border-b border-line">
          <TabButton label={`Buying (${buying.length})`} active={tab === "buying"} onClick={() => setTab("buying")} />
          <TabButton label={`Selling (${selling.length})`} active={tab === "selling"} onClick={() => setTab("selling")} />
        </div>

        <div className="mt-6 space-y-4">
          {loading ? (
            <p className="text-ink-faint">Loading orders…</p>
          ) : list.length === 0 ? (
            <div className="rounded-lg border border-dashed border-line bg-surface px-6 py-14 text-center">
              <h3 className="font-display text-lg font-medium">
                {tab === "buying" ? "No orders yet" : "No incoming orders yet"}
              </h3>
              <p className="mt-2 text-sm text-ink-soft">
                {tab === "buying"
                  ? "Items you order via Cash on Delivery will show up here."
                  : "When a buyer places a COD order on one of your listings, it'll show up here."}
              </p>
              <Link href="/" className="mt-5 inline-block font-semibold text-brand hover:underline">
                Browse the marketplace →
              </Link>
            </div>
          ) : (
            list.map((order) => (
              <div key={order._id} className="rounded-lg border border-line bg-surface p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex gap-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-line bg-paper">
                      {order.listing?.images?.[0] ? (
                        <Image src={order.listing.images[0]} alt={order.itemTitle} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl">📦</div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{order.itemTitle}</p>
                      <p className="mt-1 text-sm text-ink-faint">₹{order.amount} · COD</p>
                      <p className="text-xs text-ink-faint">
                        Ordered {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`h-fit rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[order.status]}`}>
                    {order.status}
                  </span>
                </div>

                <div className="mt-4 grid gap-2 border-t border-line pt-4 text-sm sm:grid-cols-2">
                  {tab === "buying" ? (
                    <>
                      <p className="text-ink-soft">
                        <span className="text-ink-faint">Seller:</span> {order.seller?.name || "—"}
                      </p>
                      <p className="text-ink-soft">
                        <span className="text-ink-faint">Seller phone:</span> {order.seller?.phone || "—"}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-ink-soft">
                        <span className="text-ink-faint">Buyer:</span> {order.buyerName}
                      </p>
                      <p className="text-ink-soft">
                        <span className="text-ink-faint">Buyer phone:</span> {order.buyerPhone}
                      </p>
                      <p className="text-ink-soft sm:col-span-2">
                        <span className="text-ink-faint">Deliver to:</span> {order.deliveryAddress}
                      </p>
                      {order.notes && (
                        <p className="text-ink-soft sm:col-span-2">
                          <span className="text-ink-faint">Notes:</span> {order.notes}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {tab === "selling" && order.status !== "cancelled" && order.status !== "delivered" && (
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
                    {order.status === "pending" && (
                      <button
                        onClick={() => updateStatus(order._id, "confirmed")}
                        disabled={updatingId === order._id}
                        className="rounded-md bg-brand px-4 py-2 text-xs font-semibold text-paper transition hover:bg-brand-dark disabled:opacity-60"
                      >
                        Confirm order
                      </button>
                    )}
                    {order.status === "confirmed" && (
                      <button
                        onClick={() => updateStatus(order._id, "delivered")}
                        disabled={updatingId === order._id}
                        className="rounded-md bg-brand px-4 py-2 text-xs font-semibold text-paper transition hover:bg-brand-dark disabled:opacity-60"
                      >
                        Mark delivered
                      </button>
                    )}
                    <button
                      onClick={() => updateStatus(order._id, "cancelled")}
                      disabled={updatingId === order._id}
                      className="rounded-md border border-line px-4 py-2 text-xs font-semibold text-ink-soft transition hover:border-danger hover:text-danger disabled:opacity-60"
                    >
                      Cancel order
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
        active ? "border-brand text-brand" : "border-transparent text-ink-faint hover:text-ink-soft"
      }`}
    >
      {label}
    </button>
  );
}