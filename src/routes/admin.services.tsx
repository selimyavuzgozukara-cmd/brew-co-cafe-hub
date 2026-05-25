import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Pencil, Trash2, Plus } from "lucide-react";
import { money } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/services")({ component: AdminServices });

interface Svc { id: string; name: string; description: string | null; price: number | null }

function AdminServices() {
  const [list, setList] = useState<Svc[]>([]);
  const [editing, setEditing] = useState<Partial<Svc> | null>(null);

  const load = () => supabase.from("services").select("*").order("created_at").then(({data})=>setList((data as Svc[])??[]));
  useEffect(() => { void load(); }, []);

  const save = async () => {
    if (!editing?.name) { toast.error("İsim zorunludur"); return; }
    const payload = { name: editing.name, description: editing.description ?? null, price: editing.price ? Number(editing.price) : null };
    const { error } = editing.id
      ? await supabase.from("services").update(payload).eq("id", editing.id)
      : await supabase.from("services").insert(payload);
    if (error) { toast.error(error.message); return; }
    setEditing(null); void load();
  };
  const del = async (id: string) => {
    if (!confirm("Bu hizmet silinsin mi?")) return;
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) toast.error(error.message); else void load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="font-serif text-3xl font-semibold">Hizmetler</h1>
        <Button onClick={()=>setEditing({})} className="bg-primary hover:bg-primary/90"><Plus size={14} className="mr-1" /> Hizmet ekle</Button>
      </div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left"><tr><th className="p-3">İsim</th><th>Fiyat</th><th></th></tr></thead>
          <tbody>
            {list.map(s => (
              <tr key={s.id} className="border-t border-border">
                <td className="p-3"><div className="font-medium">{s.name}</div><div className="text-xs text-muted-foreground truncate max-w-md">{s.description}</div></td>
                <td className="tabular-nums">{s.price != null ? money(s.price) : "—"}</td>
                <td className="text-right pr-3">
                  <Button variant="ghost" size="icon" onClick={()=>setEditing(s)}><Pencil size={14} /></Button>
                  <Button variant="ghost" size="icon" onClick={()=>del(s.id)}><Trash2 size={14} /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Sheet open={!!editing} onOpenChange={(v)=>!v && setEditing(null)}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader><SheetTitle className="font-serif text-2xl">{editing?.id ? "Hizmeti düzenle" : "Yeni hizmet"}</SheetTitle></SheetHeader>
          {editing && (
            <div className="space-y-3 mt-4">
              <div><Label>İsim</Label><Input value={editing.name ?? ""} onChange={(e)=>setEditing({...editing, name: e.target.value})} /></div>
              <div><Label>Açıklama</Label><Textarea value={editing.description ?? ""} onChange={(e)=>setEditing({...editing, description: e.target.value})} /></div>
              <div><Label>Fiyat (opsiyonel)</Label><Input type="number" step="0.01" value={editing.price ?? ""} onChange={(e)=>setEditing({...editing, price: e.target.value ? Number(e.target.value) : null})} /></div>
              <Button onClick={save} className="w-full bg-primary hover:bg-primary/90">Kaydet</Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
