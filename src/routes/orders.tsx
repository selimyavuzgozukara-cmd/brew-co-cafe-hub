import { createFileRoute, Link } from "@tanstack/react-router";
import { Protected } from "@/components/protected";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { money, dateShort, orderStatusLabel } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/orders")({
  head: () => ({ meta: [{ title: "Siparişlerim — Brew & Co." }] }),
  component: () => <Protected><OrdersPage /></Protected>,
});

interface Order {
  id: string; total_amount: number; status: string; created_at: string;
  order_items: { id: string; quantity: number; unit_price: number; products: { name: string } | null }[];
}

const statusStyles: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200",
  Preparing: "bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-200",
  Delivered: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200",
  Cancelled: "bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-200",
};

export function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("orders")
      .select("id,total_amount,status,created_at, order_items(id,quantity,unit_price, products(name))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setOrders((data as unknown as Order[]) ?? []));
  }, [user]);

  const active = orders?.filter((o) => o.status !== "Delivered" && o.status !== "Cancelled") ?? [];
  const completed = orders?.filter((o) => o.status === "Delivered" || o.status === "Cancelled") ?? [];

  const OrderRow = ({ o }: { o: Order }) => (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="font-medium tabular-nums">#{o.id.slice(0, 8).toUpperCase()}</div>
          <div className="text-xs text-muted-foreground">{dateShort(o.created_at)}</div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[o.status] ?? "bg-muted"}`}>{orderStatusLabel(o.status)}</span>
        <div className="font-serif text-lg font-semibold tabular-nums">{money(o.total_amount)}</div>
      </div>
      <div className="mt-3 border-t border-border pt-3 text-sm text-muted-foreground space-y-1">
        {o.order_items.map((it) => (
          <div key={it.id} className="flex justify-between">
            <span>{it.quantity} × {it.products?.name ?? "Ürün"}</span>
            <span className="tabular-nums">{money(it.unit_price * it.quantity)}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const Empty = () => (
    <div className="text-center py-16 border border-dashed border-border rounded-xl">
      <div className="mx-auto h-14 w-14 rounded-full bg-muted grid place-items-center mb-4">
        <ShoppingBag className="text-muted-foreground" />
      </div>
      <p className="font-serif text-xl">Henüz sipariş yok</p>
      <p className="text-sm text-muted-foreground mt-1">Kendinize sıcak bir şeyler ısmarlayın.</p>
      <Button asChild className="mt-4"><Link to="/products">Menüye göz at</Link></Button>
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
      <h1 className="font-serif text-4xl font-semibold mb-6">Siparişlerim</h1>
      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Aktif</TabsTrigger>
          <TabsTrigger value="completed">Tamamlanan</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="space-y-3 mt-4">
          {orders === null ? <Skeleton className="h-24 w-full" /> :
            active.length === 0 ? <Empty /> : active.map((o) => <OrderRow key={o.id} o={o} />)}
        </TabsContent>
        <TabsContent value="completed" className="space-y-3 mt-4">
          {orders === null ? <Skeleton className="h-24 w-full" /> :
            completed.length === 0 ? <Empty /> : completed.map((o) => <OrderRow key={o.id} o={o} />)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
