import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Package, ShoppingCart, Users, DollarSign } from "lucide-react";
import { money, dateShort, orderStatusLabel } from "@/lib/format";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

interface Stats { products: number; pendingOrders: number; users: number; revenue: number }

function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [daily, setDaily] = useState<{ day: string; orders: number }[]>([]);
  const [byCat, setByCat] = useState<{ name: string; value: number }[]>([]);
  const [recent, setRecent] = useState<{ id: string; total_amount: number; status: string; created_at: string }[]>([]);

  useEffect(() => {
    void (async () => {
      const [{ count: products }, { count: pendingOrders }, { count: users }, ordersAll, { data: cats }, { data: recentData }] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "Pending"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("total_amount,created_at").gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString()),
        supabase.from("categories").select("id,name, products(id)"),
        supabase.from("orders").select("id,total_amount,status,created_at").order("created_at", { ascending: false }).limit(5),
      ]);
      const revenue = (ordersAll.data ?? []).reduce((s, o) => s + Number(o.total_amount), 0);
      setStats({ products: products ?? 0, pendingOrders: pendingOrders ?? 0, users: users ?? 0, revenue });

      const days: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000);
        days[d.toISOString().slice(0, 10)] = 0;
      }
      (ordersAll.data ?? []).forEach((o) => {
        const k = o.created_at.slice(0, 10);
        if (k in days) days[k]++;
      });
      setDaily(Object.entries(days).map(([day, orders]) => ({ day: day.slice(5), orders })));

      setByCat((cats ?? []).map((c) => ({
        name: c.name,
        value: (c as { products?: unknown[] }).products?.length ?? 0,
      })));
      setRecent(recentData ?? []);
    })();
  }, []);

  const cards = stats ? [
    { label: "Toplam Ürün", value: stats.products, icon: Package },
    { label: "Bekleyen Sipariş", value: stats.pendingOrders, icon: ShoppingCart },
    { label: "Toplam Kullanıcı", value: stats.users, icon: Users },
    { label: "Aylık Gelir", value: money(stats.revenue), icon: DollarSign },
  ] : null;

  const COLORS = ["oklch(0.32 0.045 40)", "oklch(0.72 0.12 55)", "oklch(0.55 0.08 45)", "oklch(0.78 0.08 80)", "oklch(0.45 0.05 60)"];

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-semibold">Panel</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards ? cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between text-muted-foreground"><span className="text-sm">{c.label}</span><c.icon size={16} /></div>
            <div className="font-serif text-3xl font-semibold mt-2">{c.value}</div>
          </div>
        )) : Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-semibold mb-3">Son 7 günün siparişleri</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={daily}>
                <XAxis dataKey="day" stroke="oklch(0.55 0.03 50)" fontSize={12} />
                <YAxis stroke="oklch(0.55 0.03 50)" fontSize={12} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="orders" stroke="oklch(0.72 0.12 55)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-semibold mb-3">Kategoriye göre ürünler</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byCat} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                  {byCat.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold mb-3">Son siparişler</h3>
        <table className="w-full text-sm">
          <thead className="text-left text-muted-foreground">
            <tr><th className="py-2">Sipariş</th><th>Tarih</th><th>Durum</th><th className="text-right">Toplam</th></tr>
          </thead>
          <tbody>
            {recent.map((o) => (
              <tr key={o.id} className="border-t border-border">
                <td className="py-2 font-mono text-xs">#{o.id.slice(0, 8).toUpperCase()}</td>
                <td>{dateShort(o.created_at)}</td>
                <td>{orderStatusLabel(o.status)}</td>
                <td className="text-right tabular-nums">{money(o.total_amount)}</td>
              </tr>
            ))}
            {recent.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-muted-foreground">Henüz sipariş yok</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
