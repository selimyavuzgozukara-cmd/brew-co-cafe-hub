import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Plus } from "lucide-react";
import { money } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products")({ component: AdminProducts });

interface Cat { id: string; name: string }
interface Prod {
  id: string; name: string; description: string | null; price: number;
  stock_quantity: number; category_id: string | null; is_active: boolean;
  categories: { name: string } | null;
}

function AdminProducts() {
  const [list, setList] = useState<Prod[]>([]);
  const [cats, setCats] = useState<Cat[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Partial<Prod> | null>(null);
  const [del, setDel] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from("products").select("*, categories(name)").order("created_at", { ascending: false });
    setList((data as unknown as Prod[]) ?? []);
  };
  useEffect(() => { void load(); supabase.from("categories").select("id,name").order("name").then(({data})=>setCats((data as Cat[])??[])); }, []);

  const save = async () => {
    if (!editing?.name) { toast.error("İsim zorunludur"); return; }
    const payload = {
      name: editing.name, description: editing.description ?? null,
      price: Number(editing.price) || 0, stock_quantity: Number(editing.stock_quantity) || 0,
      category_id: editing.category_id ?? null, is_active: editing.is_active ?? true,
    };
    const { error } = editing.id
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Kaydedildi"); setEditing(null); void load();
  };

  const remove = async () => {
    if (!del) return;
    const { error } = await supabase.from("products").delete().eq("id", del);
    if (error) toast.error(error.message); else toast.success("Silindi");
    setDel(null); void load();
  };

  const filtered = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-3 flex-wrap">
        <h1 className="font-serif text-3xl font-semibold">Ürünler</h1>
        <Button onClick={() => setEditing({ is_active: true })} className="bg-primary hover:bg-primary/90"><Plus size={14} className="mr-1" /> Ürün ekle</Button>
      </div>
      <Input placeholder="Ara…" value={search} onChange={(e)=>setSearch(e.target.value)} className="max-w-sm" />

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr><th className="p-3">İsim</th><th>Kategori</th><th>Fiyat</th><th>Stok</th><th>Durum</th><th></th></tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3 font-medium">{p.name}</td>
                <td>{p.categories?.name ?? "—"}</td>
                <td className="tabular-nums">{money(p.price)}</td>
                <td className="tabular-nums">{p.stock_quantity}</td>
                <td>{p.is_active ? <span className="text-emerald-700">Aktif</span> : <span className="text-muted-foreground">Pasif</span>}</td>
                <td className="text-right pr-3">
                  <Button variant="ghost" size="icon" onClick={()=>setEditing(p)}><Pencil size={14} /></Button>
                  <Button variant="ghost" size="icon" onClick={()=>setDel(p.id)}><Trash2 size={14} /></Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Ürün yok</td></tr>}
          </tbody>
        </table>
      </div>

      <Sheet open={!!editing} onOpenChange={(v)=>!v && setEditing(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader><SheetTitle className="font-serif text-2xl">{editing?.id ? "Ürünü düzenle" : "Yeni ürün"}</SheetTitle></SheetHeader>
          {editing && (
            <div className="space-y-3 mt-4">
              <div><Label>İsim</Label><Input value={editing.name ?? ""} onChange={(e)=>setEditing({...editing, name: e.target.value})} /></div>
              <div><Label>Açıklama</Label><Textarea value={editing.description ?? ""} onChange={(e)=>setEditing({...editing, description: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Fiyat</Label><Input type="number" step="0.01" value={editing.price ?? 0} onChange={(e)=>setEditing({...editing, price: Number(e.target.value)})} /></div>
                <div><Label>Stok</Label><Input type="number" value={editing.stock_quantity ?? 0} onChange={(e)=>setEditing({...editing, stock_quantity: Number(e.target.value)})} /></div>
              </div>
              <div>
                <Label>Kategori</Label>
                <Select value={editing.category_id ?? ""} onValueChange={(v)=>setEditing({...editing, category_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Kategori seç" /></SelectTrigger>
                  <SelectContent>{cats.map(c=><SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between rounded-md border border-border p-3">
                <Label>Aktif</Label>
                <Switch checked={editing.is_active ?? true} onCheckedChange={(v)=>setEditing({...editing, is_active: v})} />
              </div>
              <Button onClick={save} className="w-full bg-primary hover:bg-primary/90">Kaydet</Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!del} onOpenChange={(v)=>!v && setDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Ürün silinsin mi?</AlertDialogTitle><AlertDialogDescription>Bu işlem geri alınamaz.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Vazgeç</AlertDialogCancel><AlertDialogAction onClick={remove} className="bg-destructive text-destructive-foreground">Sil</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
