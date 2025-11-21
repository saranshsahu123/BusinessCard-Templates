import type React from "react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/services/api";
import { classicTemplates } from "@/lib/classicTemplates";
import { listAllTemplates, type Template } from "@/services/templates";

interface OrderedItem {
  templateId: string;
  title?: string | null;
  price?: number | null;
  templateName?: string | null;
}

interface Payment {
  _id: string;
  amount?: number;
  currency: string;
  status?: string;
  createdAt: string;
  payment_type?: string | null;
  payment_method?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  items?: OrderedItem[];
}

export default function MyOrders() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selected, setSelected] = useState<{
    payment: Payment;
    item: OrderedItem;
  } | null>(null);

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

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const all = await listAllTemplates();
        if (alive && Array.isArray(all)) {
          setTemplates(all);
        }
      } catch {
        // ignore template load errors on orders page
      }
    })();
    return () => {
      alive = false;
    };
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
            You don't have any orders yet.
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

              const hasItems = (p.items || []).length > 0;

              return (
                <div
                  key={p._id}
                  className="border rounded-lg p-4 shadow-sm bg-card space-y-3 text-sm"
                >
                  <div className="flex items-center justify-between">
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

                  <div className="pt-2 border-t text-xs md:text-sm">
                    <div className="font-medium mb-1">Ordered cards</div>
                    {hasItems ? (
                      <div className="space-y-2">
                        {(p.items || []).map((item, idx) => {
                          const rawId = item.templateId || "";
                          const isServer = rawId.startsWith("sb:");
                          const serverId = isServer ? rawId.slice(3) : rawId;
                          const serverTemplate = templates.find(
                            (t) => t.id === serverId
                          );
                          const classicTemplate = classicTemplates.find(
                            (t) => t.id === rawId
                          );

                          let previewStyle:
                            | React.CSSProperties
                            | undefined;
                          if (classicTemplate) {
                            if (
                              classicTemplate.bgStyle === "gradient" &&
                              classicTemplate.bgColors.length >= 2
                            ) {
                              previewStyle = {
                                background: `linear-gradient(135deg, ${classicTemplate.bgColors[0]}, ${classicTemplate.bgColors[1]})`,
                              };
                            } else {
                              previewStyle = {
                                backgroundColor:
                                  classicTemplate.bgColors[0],
                              };
                            }
                          }

                          const displayName =
                            item.templateName ||
                            serverTemplate?.name ||
                            classicTemplate?.name ||
                            rawId;

                          return (
                            <div
                              key={idx}
                              className="flex items-center justify-between gap-3 cursor-pointer hover:bg-muted/60 rounded-md px-2 py-1"
                              onClick={() =>
                                setSelected({ payment: p, item })
                              }
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {serverTemplate?.thumbnail_url ||
                                serverTemplate?.back_background_url ||
                                (serverTemplate as any)?.background_url ? (
                                  <img
                                    src={(serverTemplate?.thumbnail_url ||
                                      serverTemplate?.back_background_url ||
                                      (serverTemplate as any)?.background_url) as string}
                                    alt={displayName}
                                    className="h-14 w-24 object-cover rounded border"
                                  />
                                ) : classicTemplate ? (
                                  <div
                                    className="h-14 w-24 rounded border shadow-sm"
                                    style={previewStyle}
                                  />
                                ) : (
                                  <div className="h-14 w-24 rounded border bg-muted flex items-center justify-center text-[10px] text-muted-foreground">
                                    No preview
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <div className="font-medium truncate">
                                    {displayName}
                                  </div>
                                  <div className="text-[11px] text-muted-foreground truncate">
                                    For: {item.title || "Business Card"}
                                  </div>
                                  <div className="text-[11px] text-muted-foreground truncate">
                                    ID: {rawId}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right whitespace-nowrap">
                                <span className="font-medium">₹</span>{" "}
                                <span className="font-medium">
                                  {item.price != null
                                    ? item.price.toFixed(2)
                                    : "-"}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-muted-foreground text-[11px]">
                        No card items saved for this order.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selected && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4">
            <div className="bg-card max-w-4xl w-full rounded-xl shadow-2xl border border-border p-4 md:p-6 relative">
              <button
                type="button"
                className="absolute top-3 right-3 text-xs px-2 py-1 rounded-full bg-muted hover:bg-muted/80"
                onClick={() => setSelected(null)}
              >
                Close
              </button>

              {(() => {
                const payment = selected.payment;
                const item = selected.item;
                const rawId = item.templateId || "";
                const isServer = rawId.startsWith("sb:");
                const serverId = isServer ? rawId.slice(3) : rawId;
                const serverTemplate = templates.find(
                  (t) => t.id === serverId
                );
                const classicTemplate = classicTemplates.find(
                  (t) => t.id === rawId
                );

                let previewStyle:
                  | React.CSSProperties
                  | undefined;
                if (classicTemplate) {
                  if (
                    classicTemplate.bgStyle === "gradient" &&
                    classicTemplate.bgColors.length >= 2
                  ) {
                    previewStyle = {
                      background: `linear-gradient(135deg, ${classicTemplate.bgColors[0]}, ${classicTemplate.bgColors[1]})`,
                    };
                  } else {
                    previewStyle = {
                      backgroundColor: classicTemplate.bgColors[0],
                    };
                  }
                }

                const displayName =
                  item.templateName ||
                  serverTemplate?.name ||
                  classicTemplate?.name ||
                  rawId;

                const fullAddress =
                  [
                    payment.address_line1,
                    payment.address_line2,
                    payment.city,
                    payment.state,
                    payment.pincode,
                  ]
                    .filter(Boolean)
                    .join(", ") || "-";

                return (
                  <div className="space-y-4 text-sm">
                    <div>
                      <h2 className="text-lg font-semibold mb-1">
                        Card details
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Order on{" "}
                        {new Date(
                          payment.createdAt
                        ).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="w-full lg:w-1/3 flex flex-col gap-2">
                        <div className="text-[11px] font-medium text-muted-foreground">
                          Front
                        </div>
                        <div className="flex items-center justify-center">
                          {serverTemplate?.thumbnail_url ||
                          serverTemplate?.back_background_url ||
                          (serverTemplate as any)?.background_url ? (
                            <img
                              src={(serverTemplate?.thumbnail_url ||
                                serverTemplate?.back_background_url ||
                                (serverTemplate as any)?.background_url) as string}
                              alt={displayName}
                              className="w-full rounded-lg border object-cover"
                            />
                          ) : classicTemplate ? (
                            <div
                              className="w-full aspect-[1.75/1] rounded-lg border shadow-sm"
                              style={previewStyle}
                            />
                          ) : (
                            <div className="w-full aspect-[1.75/1] rounded-lg border bg-muted flex items-center justify-center text-[11px] text-muted-foreground">
                              No preview
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="w-full lg:w-1/3 flex flex-col gap-4 mt-6 lg:mt-0">
                        <div className="text-[11px] font-medium text-muted-foreground">
                          Back
                        </div>
                        <div className="flex items-center justify-center">

                          {serverTemplate?.back_background_url ||
                          serverTemplate?.thumbnail_url ? (
                            <img
                              src={
                                serverTemplate.back_background_url ||
                                serverTemplate.thumbnail_url!
                              }
                              alt={displayName}
                              className="w-full rounded-lg border object-cover"
                            />
                          ) : classicTemplate ? (
                            <div
                              className="w-full aspect-[1.75/1] rounded-lg border shadow-sm"
                              style={previewStyle}
                            />
                          ) : (
                            <div className="w-full aspect-[1.75/1] rounded-lg border bg-muted flex items-center justify-center text-[11px] text-muted-foreground">
                              No preview
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="w-full lg:w-1/3 space-y-2 mt-6 lg:mt-0">
                        <div className="font-semibold text-sm">
                          {displayName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          For: {item.title || "Business Card"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Template ID: {rawId}
                        </div>
                        <div className="text-sm font-medium mt-2">
                          Amount paid: ₹
                          {item.price != null
                            ? item.price.toFixed(2)
                            : "-"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Overall payment: ₹
                          {payment.amount != null
                            ? payment.amount.toFixed(2)
                            : "-"}{" "}
                          {payment.currency}
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-3 space-y-2">
                      <div className="font-medium text-sm">
                        Delivery address
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {payment.customer_name || "-"}
                        {payment.customer_phone
                          ? ` • ${payment.customer_phone}`
                          : ""}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {fullAddress}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}