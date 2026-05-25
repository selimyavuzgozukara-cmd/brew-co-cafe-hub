import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { money, dateShort, orderStatusLabel } from "@/lib/format";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders")({ component: AdminOrders });

interface Order {
  id: string; user_id: string; total_amount: number; status: string; created_at: string;
  profiles: { first_name: string | null; last_name: string | null; email: string | null } | null;
  order_items: { id: string; quantity: number; unit_price: number; products: { name: string } | null }[];
}

const STATUSES = ["Pending", "Preparing", "Delivered", "Cancelled"];

function AdminOrders() {
  const [list, setList] = useState<Order[]>([]);
  const [detail, setDetail] = useState<Order | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(id,quantity,unit_price, products(name))")
      .order("created_at", { ascending: false });
    const rows = (data as unknown as Order[]) ?? [];
    const ids = [...new Set(rows.map(r => r.user_id))];
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("id,first_name,last_name,email").in("id", ids);
      const map = new Map((profs ?? []).map(p => [p.id, p]));
      rows.forEach(r => { r.profiles = (map.get(r.user_id) as Order["profiles"]) ?? null; });
    }
    setList(rows);
  };
  useEffect(() => { void load(); }, []);

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Durum güncellendi"); void load(); }
  };

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-3xl font-semibold">Siparişler</h1>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr><th className="p-3">Sipariş</th><th>Müşteri</th><th>Ürünler</th><th>Tarih</th><th>Durum</th><th className="text-right pr-3">Toplam</th></tr>
          </thead>
          <tbody>
            {list.map(o => (
              <tr key={o.id} className="border-t border-border hover:bg-muted/30 cursor-pointer" onClick={()=>setDetail(o)}>
                <td className="p-3 font-mono text-xs">#{o.id.slice(0,8).toUpperCase()}</td>
                <td>{o.profiles?.first_name} {o.profiles?.last_name}</td>
                <td className="text-muted-foreground">{o.order_items.length} ürün</td>
                <td>{dateShort(o.created_at)}</td>
                <td onClick={(e)=>e.stopPropagation()}>
                  <Select value={o.status} onValueChange={(v)=>setStatus(o.id, v)}>
                    <SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{orderStatusLabel(s)}</SelectItem>)}</SelectContent>
                  </Select>
                </td>
                <td className="text-right pr-3 tabular-nums">{money(o.total_amount)}</td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Sipariş yok</td></tr>}
          </tbody>
        </table>
      </div>

      <Dialog open={!!detail} onOpenChange={(v)=>!v && setDetail(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Sipariş #{detail?.id.slice(0,8).toUpperCase()}</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                {detail.profiles?.first_name} {detail.profiles?.last_name} · {detail.profiles?.email}
              </div>
              <div className="border border-border rounded-md divide-y divide-border">
                {detail.order_items.map(i => (
                  <div key={i.id} className="flex justify-between p-3 text-sm">
                    <span>{i.quantity} × {i.products?.name}</span>
                    <span className="tabular-nums">{money(i.unit_price * i.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-semibold pt-2"><span>Toplam</span><span className="tabular-nums">{money(detail.total_amount)}</span></div>
              <Button variant="outline" onClick={()=>setDetail(null)}>Kapat</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
