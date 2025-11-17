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

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Payments</h1>
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
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 border">Email</th>
                <th className="px-3 py-2 border">Amount</th>
                <th className="px-3 py-2 border">Status</th>
                <th className="px-3 py-2 border">Customer</th>
                <th className="px-3 py-2 border">Phone</th>
                <th className="px-3 py-2 border">Address</th>
                <th className="px-3 py-2 border">Payment Type</th>
                <th className="px-3 py-2 border">Method</th>
                <th className="px-3 py-2 border">Bank Ref / UPI ID</th>
                <th className="px-3 py-2 border">Card Last4</th>
                <th className="px-3 py-2 border">Issuer Bank</th>
                <th className="px-3 py-2 border">Order ID</th>
                <th className="px-3 py-2 border">Payment ID</th>
                <th className="px-3 py-2 border">Location</th>
                <th className="px-3 py-2 border">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id}>
                  <td className="px-3 py-2 border">{p.email}</td>
                  <td className="px-3 py-2 border">
                    {p.amount != null ? `₹${p.amount}` : "-"} {p.currency}
                  </td>
                  {/* <td className="px-3 py-2 border">
                    <span className="uppercase text-xs font-semibold">
                      {p.status || "-"}
                    </span>
                  </td> */}
                  <td className="px-3 py-2 border">
                    {(() => {
                      const status = (p.status || "").toLowerCase();

                      let colorClass = "bg-gray-100 text-gray-800";
                      if (status === "captured" || status === "success") {
                        colorClass = "bg-green-100 text-green-800";
                      } else if (status === "failed") {
                        colorClass = "bg-red-100 text-red-800";
                      } else if (status === "pending" || status === "created") {
                        colorClass = "bg-yellow-100 text-yellow-800";
                      }

                      return (
                        <span
                          className={
                            "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase " +
                            colorClass
                          }
                        >
                          {p.status || "-"}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-3 py-2 border">{p.customer_name || "-"}</td>
                  <td className="px-3 py-2 border">{p.customer_phone || "-"}</td>
                  <td className="px-3 py-2 border">
                    {[
                      p.address_line1,
                      p.address_line2,
                      p.city,
                      p.state,
                      p.pincode,
                    ]
                      .filter(Boolean)
                      .join(", ") || "-"}
                  </td>
                  <td className="px-3 py-2 border">{p.payment_type || "-"}</td>
                  <td className="px-3 py-2 border">{p.payment_method || "-"}</td>
                  <td className="px-3 py-2 border">{p.bank_reference_id || "-"}</td>
                  <td className="px-3 py-2 border">{p.card_last4 || "-"}</td>
                  <td className="px-3 py-2 border">{p.issuer_bank || "-"}</td>
                  <td className="px-3 py-2 border">{p.razorpay_order_id}</td>
                  <td className="px-3 py-2 border">{p.razorpay_payment_id}</td>
                  <td className="px-3 py-2 border">{p.live_location || "-"}</td>
                  <td className="px-3 py-2 border">
                    {new Date(p.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;