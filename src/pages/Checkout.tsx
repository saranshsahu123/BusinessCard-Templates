import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { classicTemplates } from "@/lib/classicTemplates";
import { ClassicCard } from "@/components/templates/ClassicCard";
import { BackSideCard } from "@/components/templates/BackSideCard";
import { downloadAsImage } from "@/lib/utils";
import { apiFetch } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  const primaryItem = items[0];
  const effectiveNameDisplay =
    customerName.trim() || primaryItem?.data?.name || "";
  const effectivePhoneDisplay =
    customerPhone.trim() || primaryItem?.data?.phone || "";

  const trimmedPincode = pincode.trim();
  const isPincodeValid = /^[1-9][0-9]{5}$/.test(trimmedPincode);

  const isFormValid = !!(
    effectiveNameDisplay &&
    effectivePhoneDisplay &&
    addressLine1.trim() &&
    city.trim() &&
    state.trim() &&
    isPincodeValid
  );

  const frontRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const backRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Modals
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [pendingAddress, setPendingAddress] = useState("");
  const [pendingName, setPendingName] = useState("");
  const [pendingPhone, setPendingPhone] = useState("");

  async function getLiveLocationString(): Promise<string | null> {
    if (!("geolocation" in navigator)) return null;
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve(`${pos.coords.latitude},${pos.coords.longitude}`);
        },
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  }

  const byId = useMemo(() => {
    const map: Record<string, any> = {};
    for (const t of classicTemplates) map[t.id] = t;
    return map;
  }, []);

  useEffect(() => {
    // cart empty hai to checkout ka koi sense nahi
    if (items.length === 0) {
      navigate("/cart");
      return;
    }
    // jab tak auth loading hai, kuch mat karo
  }, [items.length, navigate]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setShowLoginModal(true);
    }
  }, [user, loading]);

  const handleLoginConfirm = () => {
    setShowLoginModal(false);
    navigate("/login");
  };

  const handleLoginCancel = () => {
    setShowLoginModal(false);
    navigate("/"); // ya "/cart"
  };

  const handleAddressConfirm = () => {
    setShowAddressModal(false);
    startPayment(pendingName, pendingPhone);
  };

  const handleAddressCancel = () => {
    setShowAddressModal(false);
  };

  async function startPayment(customer_name: string, customer_phone: string) {
    setProcessing(true);

    try {
      const res = await apiFetch("/payments/create-order", {
        method: "POST",
        body: JSON.stringify({
          amount: Math.round(total),
        }),
      });

      const { order } = res as any;
      const live_location = await getLiveLocationString();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Business Card Purchase",
        description: "Business card templates",
        order_id: order.id,
        prefill: {
          email: user?.email || "",
        },
        handler: async (response: any) => {
          try {
            const verifyRes = await apiFetch("/payments/verify", {
              method: "POST",
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: Math.round(total),
                customer_name,
                customer_phone,
                live_location,
                address_line1: addressLine1,
                address_line2: addressLine2,
                city,
                state,
                pincode,
              }),
            });

            if ((verifyRes as any).success) {
              for (const it of items) {
                const fid = it.id;
                const f = frontRefs.current[fid];
                const b = backRefs.current[fid];
                if (f) await downloadAsImage(f, `${fid}-front`);
                if (b) await downloadAsImage(b, `${fid}-back`);
              }
              clear();
              navigate("/");
            } else {
              alert("Payment verification failed");
            }
          } catch (e: any) {
            alert(e.message || "Payment verification error");
          } finally {
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e: any) {
      alert(e.message || "Unable to start payment");
      setProcessing(false);
    }
  }

  async function onPay() {
    if (processing || items.length === 0) return;

    // extra safety guard
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    setShowErrors(true);

    const effectiveName =
      customerName.trim() || primaryItem?.data?.name || "";
    const effectivePhone =
      customerPhone.trim() || primaryItem?.data?.phone || "";

    if (
      !effectiveName ||
      !effectivePhone ||
      !addressLine1.trim() ||
      !city.trim() ||
      !state.trim() ||
      !pincode.trim()
    ) {
      alert("Please fill all required address details before payment.");
      return;
    }

    const deliveryAddress = [
      effectiveName,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
    ]
      .filter((x) => x && x.trim())
      .join(", ");

    setPendingAddress(deliveryAddress);
    setPendingName(effectiveName);
    setPendingPhone(effectivePhone);
    setShowAddressModal(true);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40">
      <main className="container mx-auto max-w-4xl px-4 py-10">
        <div className="mb-6 space-y-2">
          <h1 className="text-3xl font-bold">Checkout</h1>
          <p className="text-sm text-muted-foreground">
            Review your details and complete your secure payment.
          </p>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                1
              </div>
              <span>Customer Details</span>
            </div>
            <div className="h-px w-8 bg-border" />
            <div className="flex items-center gap-2 opacity-80">
              <div className="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-semibold">
                2
              </div>
              <span>Payment</span>
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-muted-foreground">Your cart is empty.</div>
        ) : (
          <>
            <div className="grid gap-8 mb-10 md:grid-cols-[2fr,1.5fr]">
              <div className="space-y-4 border rounded-xl p-4 md:p-5 bg-card shadow-sm">
                <h2 className="text-lg font-semibold mb-1">
                  Shipping Details
                </h2>
                <p className="text-xs text-muted-foreground mb-1">
                  We'll use these details to deliver your printed cards.
                </p>
                <div className="grid gap-3">
                  <div className="grid gap-1">
                    <label className="text-sm font-medium">Full Name *</label>
                    <input
                      className="border rounded px-3 py-2 text-sm"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder={primaryItem?.data?.name || "Your Name"}
                    />
                    {showErrors && !effectiveNameDisplay && (
                      <p className="text-xs text-red-500 mt-1">
                        Full name is required.
                      </p>
                    )}
                  </div>
                  <div className="grid gap-1">
                    <label className="text-sm font-medium">Phone *</label>
                    <input
                      className="border rounded px-3 py-2 text-sm"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder={primaryItem?.data?.phone || "Phone number"}
                    />
                    {showErrors && !effectivePhoneDisplay && (
                      <p className="text-xs text-red-500 mt-1">
                        Phone number is required.
                      </p>
                    )}
                  </div>
                  <div className="grid gap-1">
                    <label className="text-sm font-medium">
                      Address Line 1 *
                    </label>
                    <input
                      className="border rounded px-3 py-2 text-sm"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      placeholder="House / Flat, Street"
                    />
                    {showErrors && !addressLine1.trim() && (
                      <p className="text-xs text-red-500 mt-1">
                        Address line 1 is required.
                      </p>
                    )}
                  </div>
                  <div className="grid gap-1">
                    <label className="text-sm font-medium">
                      Address Line 2
                    </label>
                    <input
                      className="border rounded px-3 py-2 text-sm"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      placeholder="Area, Landmark (optional)"
                    />
                  </div>
                  <div className="grid gap-3 md:grid-cols-1">
                    <div className="grid gap-1">
                      <label className="text-sm font-medium">
                        City *
                      </label>
                      <input
                        className="border rounded px-3 py-2 text-sm"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                      {showErrors && !city.trim() && (
                        <p className="text-xs text-red-500 mt-1">
                          City is required.
                        </p>
                      )}
                    </div>
                    <div className="grid gap-1">
                      <label className="text-sm font-medium">
                        State *
                      </label>
                      <select
                        className="border rounded px-3 py-2 text-sm bg-background"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                      >
                        <option value="">Select state</option>
                        {/* States */}
                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                        <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                        <option value="Assam">Assam</option>
                        <option value="Bihar">Bihar</option>
                        <option value="Chhattisgarh">Chhattisgarh</option>
                        <option value="Goa">Goa</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Haryana">Haryana</option>
                        <option value="Himachal Pradesh">Himachal Pradesh</option>
                        <option value="Jharkhand">Jharkhand</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Kerala">Kerala</option>
                        <option value="Madhya Pradesh">Madhya Pradesh</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Manipur">Manipur</option>
                        <option value="Meghalaya">Meghalaya</option>
                        <option value="Mizoram">Mizoram</option>
                        <option value="Nagaland">Nagaland</option>
                        <option value="Odisha">Odisha</option>
                        <option value="Punjab">Punjab</option>
                        <option value="Rajasthan">Rajasthan</option>
                        <option value="Sikkim">Sikkim</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Telangana">Telangana</option>
                        <option value="Tripura">Tripura</option>
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                        <option value="Uttarakhand">Uttarakhand</option>
                        <option value="West Bengal">West Bengal</option>
                        {/* Union Territories */}
                        <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                        <option value="Chandigarh">Chandigarh</option>
                        <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                        <option value="Ladakh">Ladakh</option>
                        <option value="Lakshadweep">Lakshadweep</option>
                        <option value="Puducherry">Puducherry</option>
                      </select>
                      {showErrors && !state.trim() && (
                        <p className="text-xs text-red-500 mt-1">
                          State is required.
                        </p>
                      )}
                    </div>
                    <div className="grid gap-1">
                      <label className="text-sm font-medium">
                        Pincode *
                      </label>
                      <input
                        className="border rounded px-3 py-2 text-sm"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        maxLength={6}
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                      {showErrors && !isPincodeValid && (
                        <p className="text-xs text-red-500 mt-1">
                          Enter a valid 6-digit pincode.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t mt-2 text-xs text-muted-foreground">
                  <span className="font-medium">Deliver to:&nbsp;</span>
                  {addressLine1 || addressLine2 || city || state || pincode
                    ? [
                        addressLine1,
                        addressLine2,
                        city,
                        state,
                        pincode,
                      ]
                        .filter((x) => x && x.trim())
                        .join(", ")
                    : "Add your full address above"}
                </div>
              </div>

              <div className="space-y-3">
                <div className="border rounded-xl p-4 bg-card shadow-sm space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-sm font-semibold">Order Summary</h2>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-600/90 text-emerald-50 border border-emerald-700">
                      Secure payment
                    </span>
                  </div>
                  <div className="space-y-2">
                    {items.map((it) => (
                      <div
                        key={it.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div>
                          <div className="font-medium">{it.id}</div>
                          <div className="text-xs text-muted-foreground">
                            {it.data?.name || "Your Name"} •{" "}
                            {it.data?.company || "Company"}
                          </div>
                        </div>
                        <div className="text-sm font-medium">
                          ₹{it.price.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between border-t pt-3 mt-2 text-sm">
                    <div className="font-semibold">Total</div>
                    <div className="font-semibold">
                      ₹{total.toFixed(2)}
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Payments are processed securely via Razorpay.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mb-4 md:mb-10">
              <Button variant="outline" onClick={() => navigate("/cart")}>
                Back to Cart
              </Button>
              <Button
                onClick={onPay}
                disabled={processing || !isFormValid}
              >
                {processing
                  ? "Processing..."
                  : isFormValid
                  ? "Pay Now"
                  : "Complete details to pay"}
              </Button>
            </div>

            <div
              style={{
                position: "absolute",
                left: -99999,
                top: -99999,
              }}
            >
              {items.map((it) => {
                const config = byId[it.id];
                if (!config) return null;
                return (
                  <div key={it.id}>
                    <div
                      ref={(el) => {
                        frontRefs.current[it.id] = el;
                      }}
                    >
                      <ClassicCard
                        data={it.data}
                        config={config}
                        fontFamily={it.selectedFont}
                        fontSize={it.fontSize}
                        textColor={it.textColor}
                        accentColor={it.accentColor}
                      />
                    </div>
                    <div
                      ref={(el) => {
                        backRefs.current[it.id] = el;
                      }}
                    >
                      <BackSideCard
                        data={it.data}
                        background={{
                          style:
                            config.bgStyle === "solid"
                              ? "solid"
                              : "gradient",
                          colors: config.bgColors,
                        }}
                        textColor={it.textColor}
                        accentColor={it.accentColor}
                        fontFamily={it.selectedFont}
                        fontSize={it.fontSize}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Login modal (center, bigger) */}
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-base">
              <h2 className="text-lg font-semibold mb-3">Login required</h2>
              <p className="text-[15px] text-gray-700 mb-5 leading-relaxed">
                Please login or sign up before making a payment. Do you want to
                go to the login page now?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 text-sm rounded border border-gray-300 hover:bg-gray-50"
                  onClick={handleLoginCancel}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 text-sm rounded bg-primary text-primary-foreground hover:brightness-95"
                  onClick={handleLoginConfirm}
                >
                  Go to Login
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Address confirm modal (center, bigger) */}
        {showAddressModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 text-base">
              <h2 className="text-lg font-semibold mb-3">
                Confirm delivery address
              </h2>
              <p className="text-[15px] text-gray-700 mb-4 leading-relaxed">
                Please confirm your delivery address before proceeding to
                payment:
              </p>
              <div className="border rounded-lg bg-gray-50 p-4 text-sm mb-5">
                {pendingAddress || "-"}
              </div>
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 text-sm rounded border border-gray-300 hover:bg-gray-50"
                  onClick={handleAddressCancel}
                >
                  Edit address
                </button>
                <button
                  className="px-4 py-2 text-sm rounded bg-primary text-primary-foreground hover:brightness-95"
                  onClick={handleAddressConfirm}
                >
                  Confirm &amp; Pay
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}