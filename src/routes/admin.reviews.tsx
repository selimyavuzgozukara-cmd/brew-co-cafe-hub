import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/star-rating";
import { dateShort, reviewStatusLabel } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/reviews")({ component: AdminReviews });

interface Review {
  id: string; rating: number; comment: string | null; status: string; created_at: string;
  user_id: string; product_id: string;
  products: { name: string } | null;
}

function AdminReviews() {
  const [list, setList] = useState<Review[]>([]);
  const load = () =>
    supabase.from("reviews").select("*, products(name)").order("created_at", { ascending: false })
      .then(({data}) => setList((data as unknown as Review[]) ?? []));
  useEffect(() => { void load(); }, []);

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("reviews").update({ status }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success(reviewStatusLabel(status)); void load(); }
  };

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-3xl font-semibold">Yorumlar</h1>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr><th className="p-3">Ürün</th><th>Puan</th><th>Yorum</th><th>Tarih</th><th>Durum</th><th></th></tr>
          </thead>
          <tbody>
            {list.map(r => (
              <tr key={r.id} className="border-t border-border">
                <td className="p-3 font-medium">{r.products?.name}</td>
                <td><StarRating value={r.rating} size={12} /></td>
                <td className="text-muted-foreground max-w-xs truncate">{r.comment}</td>
                <td>{dateShort(r.created_at)}</td>
                <td><span className="text-xs px-2 py-0.5 rounded-full bg-muted">{reviewStatusLabel(r.status)}</span></td>
                <td className="text-right pr-3 space-x-1">
                  {r.status !== "approved" && <Button size="sm" variant="outline" onClick={()=>setStatus(r.id, "approved")}>Onayla</Button>}
                  {r.status !== "rejected" && <Button size="sm" variant="ghost" onClick={()=>setStatus(r.id, "rejected")}>Reddet</Button>}
                </td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Yorum yok</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
