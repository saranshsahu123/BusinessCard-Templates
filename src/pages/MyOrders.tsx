import { useEffect, useState } from "react";
import { apiFetch } from "@/services/api";

interface Payment {
  _id: string;
  amount?: number;
  currency: string;
  status?: string;
  createdAt: string;
  payment_type?: string | null;
  payment_method?: string | null;
}

export default function MyOrders() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiFetch("/payments/my");
        const data = res as any;
        setPayments(data.payments || []);
      } catch (e: any) {
        setError(e.message || "Failed to load your orders");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40">
      <main className="container mx-auto max-w-3xl px-4 py-10">
        <div className="mb-6 space-y-2">
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="text-sm text-muted-foreground">
            View your previous card orders and payment status.
          </p>
        </div>

        {loading && <p className="text-sm">Loading your orders...</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
        {!loading && !error && payments.length === 0 && (
          <p className="text-sm text-muted-foreground">
            You don&apos;t have any orders yet.
          </p>
        )}

        {!loading && payments.length > 0 && (
          <div className="space-y-4">
            {payments.map((p) => {
              const status = (p.status || "").toLowerCase();
              let statusColor = "bg-gray-100 text-gray-800";
              if (status === "captured" || status === "success") {
                statusColor = "bg-green-100 text-green-800";
              } else if (status === "failed") {
                statusColor = "bg-red-100 text-red-800";
              } else if (status === "pending" || status === "created") {
                statusColor = "bg-yellow-100 text-yellow-800";
              }

              return (
                <div
                  key={p._id}
                  className="border rounded-lg p-4 shadow-sm bg-card flex items-center justify-between text-sm"
                >
                  <div className="space-y-1">
                    <div className="font-medium">
                      Order on {new Date(p.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Payment type: {p.payment_type || "-"} · Method:{" "}
                      {p.payment_method || "-"}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="font-semibold">
                      ₹{p.amount != null ? p.amount.toFixed(2) : "-"}{" "}
                      {p.currency}
                    </div>
                    <span
                      className={
                        "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase " +
                        statusColor
                      }
                    >
                      {p.status || "-"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}