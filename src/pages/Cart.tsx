// d:\Card\FinalBusinessCard2\src\pages\Cart.tsx
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function CartPage() {
  const { items, remove, clear, total } = useCart();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">Cart</h1>
        {items.length === 0 ? (
          <div className="text-muted-foreground">Your cart is empty.</div>
        ) : (
          <div className="space-y-4">
            {items.map((it) => (
              <div
                key={it.id}
                className="flex items-center justify-between border rounded-lg p-4"
              >
                <div>
                  <div className="font-medium">{it.id}</div>
                  <div className="text-sm text-muted-foreground">
                    {it.data?.name || "Your Name"} •{" "}
                    {it.data?.company || "Company"}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm">₹{it.price.toFixed(2)}</div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => remove(it.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between border-t pt-4">
              <div className="font-semibold">Total</div>
              <div className="font-semibold">₹{total.toFixed(2)}</div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={clear}>
                Clear
              </Button>
              <Button onClick={() => navigate("/checkout")}>
                Buy Now
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}