import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { money } from "@/lib/format";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

export function CartDrawer() {
  const { items, open, setOpen, update, remove, clear, subtotal, tax, total } = useCart();
  const { user } = useAuth();
  const [placing, setPlacing] = useState(false);

  const placeOrder = async () => {
    if (!user) return;
    setPlacing(true);
    try {
      const { data: order, error } = await supabase
        .from("orders")
        .insert({ user_id: user.id, total_amount: total, status: "Pending" })
        .select()
        .single();
      if (error) throw error;
      const { error: itemsErr } = await supabase.from("order_items").insert(
        items.map((i) => ({
          order_id: order.id,
          product_id: i.id,
          quantity: i.quantity,
          unit_price: i.price,
        }))
      );
      if (itemsErr) throw itemsErr;
      toast.success("Order placed! We're brewing it now.");
      clear();
      setOpen(false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Could not place order";
      toast.error(msg);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-serif text-2xl">Your cart</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 grid place-items-center text-center px-6">
            <div>
              <div className="mx-auto h-14 w-14 rounded-full bg-muted grid place-items-center mb-4">
                <ShoppingBag className="text-muted-foreground" />
              </div>
              <p className="font-medium">Your cart is empty</p>
              <p className="text-sm text-muted-foreground mt-1">Add something delicious from our menu.</p>
              <Button asChild className="mt-4" onClick={() => setOpen(false)}>
                <Link to="/products">Browse menu</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-1 -mx-1 space-y-3">
              {items.map((i) => (
                <div key={i.id} className="flex gap-3 p-3 rounded-lg border border-border bg-card">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{i.name}</div>
                    <div className="text-sm text-muted-foreground">{money(i.price)} each</div>
                    <div className="mt-2 inline-flex items-center rounded-md border border-border">
                      <button className="px-2 py-1 hover:bg-muted" onClick={() => update(i.id, i.quantity - 1)} aria-label="Decrease"><Minus size={14} /></button>
                      <span className="px-3 text-sm tabular-nums">{i.quantity}</span>
                      <button className="px-2 py-1 hover:bg-muted disabled:opacity-50" onClick={() => update(i.id, i.quantity + 1)} disabled={i.quantity >= i.stock} aria-label="Increase"><Plus size={14} /></button>
                    </div>
                  </div>
                  <div className="text-right flex flex-col justify-between items-end">
                    <button onClick={() => remove(i.id)} className="text-muted-foreground hover:text-destructive" aria-label="Remove">
                      <Trash2 size={16} />
                    </button>
                    <div className="font-medium tabular-nums">{money(i.price * i.quantity)}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="tabular-nums">{money(subtotal)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tax (18%)</span><span className="tabular-nums">{money(tax)}</span></div>
              <div className="flex justify-between text-base font-semibold pt-2 border-t border-border"><span>Total</span><span className="tabular-nums">{money(total)}</span></div>

              {user ? (
                <Button onClick={placeOrder} disabled={placing} className="w-full mt-3 bg-primary hover:bg-primary/90">
                  {placing ? "Placing order…" : "Place order"}
                </Button>
              ) : (
                <div className="mt-3 p-3 rounded-md bg-muted text-sm text-muted-foreground text-center">
                  Please <Link to="/login" onClick={() => setOpen(false)} className="font-medium text-foreground underline">log in</Link> to place an order.
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
