import { useEffect, useState } from "react";
import { apiFetch } from "@/services/api";

interface Payment {
  _id: string;
  email: string;
  amount?: number;
  currency: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  createdAt: string;

  status?: string;
  customer_name?: string;
  customer_phone?: string;
  live_location?: string | null;

  payment_type?: string | null;
  payment_method?: string | null;

  bank_reference_id?: string | null;
  card_last4?: string | null;
  issuer_bank?: string | null;

  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
}

const PaymentsPage = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let firstLoad = true;
    let pollingTimer: number | undefined;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiFetch("/payments/admin-list");
        const data = res as any;
        const newPayments: Payment[] = data.payments || [];

        // Naya payment detect karo (sirf second+ loads pe)
        if (!firstLoad) {
          const prevLatestId = payments[0]?._id;
          const latestId = newPayments[0]?._id;
          if (latestId && latestId !== prevLatestId) {
            setAlert("New payment received");
            window.setTimeout(() => setAlert(null), 5000);
          }
        }

        setPayments(newPayments);
        firstLoad = false;
      } catch (e: any) {
        setError(e.message || "Failed to load payments");
      } finally {
        setLoading(false);
      }
    };

    load();

    // Poll every 10s for new payments
    pollingTimer = window.setInterval(load, 10000);

    return () => {
      if (pollingTimer) window.clearInterval(pollingTimer);
    };
  }, []);

  const filteredPayments = payments.filter((p) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;

    const name = (p.customer_name || "").toLowerCase();
    const email = (p.email || "").toLowerCase();

    return name.includes(term) || email.includes(term);
  });

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Payments</h1>

      {/* Search bar */}
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-gray-600">
          Search by customer name or email
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name / email..."
          className="w-full md:w-72 px-3 py-2 border rounded-md text-sm"
        />
      </div>

      {alert && (
        <div className="mb-3 rounded border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-800">
          {alert}
        </div>
      )}
      {loading && <p className="text-sm">Loading...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
      {!loading && !error && payments.length === 0 && (
        <p className="text-sm">No payments found.</p>
      )}

      {!loading && payments.length > 0 && (
        <div className="space-y-4">
          {filteredPayments.map((p) => {
            const status = (p.status || "").toLowerCase();
            let statusColor = "bg-gray-100 text-gray-800";
            if (status === "captured" || status === "success") {
              statusColor = "bg-green-100 text-green-800";
            } else if (status === "failed") {
              statusColor = "bg-red-100 text-red-800";
            } else if (status === "pending" || status === "created") {
              statusColor = "bg-yellow-100 text-yellow-800";
            }

            const fullAddress =
              [
                p.address_line1,
                p.address_line2,
                p.city,
                p.state,
                p.pincode,
              ]
                .filter(Boolean)
                .join(", ") || "-";

            return (
              <div
                key={p._id}
                className="border rounded-lg p-4 shadow-sm bg-white space-y-4 text-sm"
              >
                {/* 1. Transaction Details */}
                <div>
                  <h2 className="font-semibold text-sm mb-2">
                    1. Transaction Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                    <div>
                      <span className="font-medium">Payment ID:</span>{" "}
                      {p.razorpay_payment_id}
                    </div>
                    <div>
                      <span className="font-medium">Order ID:</span>{" "}
                      {p.razorpay_order_id}
                    </div>
                    <div>
                      <span className="font-medium">Amount:</span>{" "}
                      {p.amount != null ? `₹${p.amount}` : "-"} {p.currency}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Status:</span>
                      <span
                        className={
                          "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase " +
                          statusColor
                        }
                      >
                        {p.status || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Currency:</span>{" "}
                      {p.currency}
                    </div>
                    <div>
                      <span className="font-medium">Date:</span>{" "}
                      {new Date(p.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* 2. Customer Details */}
                <div>
                  <h2 className="font-semibold text-sm mb-2">
                    2. Customer Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                    <div>
                      <span className="font-medium">Name:</span>{" "}
                      {p.customer_name || "-"}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {p.email}
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span>{" "}
                      {p.customer_phone || "-"}
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="font-medium">Address:</span>{" "}
                    {fullAddress}
                  </div>
                </div>

                {/* 3. Payment Method Details */}
                <div>
                  <h2 className="font-semibold text-sm mb-2">
                    3. Payment Method Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                    <div>
                      <span className="font-medium">Payment type:</span>{" "}
                      {p.payment_type || "-"}
                    </div>
                    <div>
                      <span className="font-medium">Method:</span>{" "}
                      {p.payment_method || "-"}
                    </div>
                    <div>
                      <span className="font-medium">Bank / UPI Ref:</span>{" "}
                      {p.bank_reference_id || "-"}
                    </div>
                    <div>
                      <span className="font-medium">Card last 4:</span>{" "}
                      {p.card_last4 || "-"}
                    </div>
                    <div>
                      <span className="font-medium">Issuer bank:</span>{" "}
                      {p.issuer_bank || "-"}
                    </div>
                    <div>
                      <span className="font-medium">Location:</span>{" "}
                      {p.live_location || "-"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;