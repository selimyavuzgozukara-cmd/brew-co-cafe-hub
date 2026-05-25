import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/categories")({ component: AdminCategories });

interface Cat { id: string; name: string }

function AdminCategories() {
  const [list, setList] = useState<Cat[]>([]);
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const load = () => supabase.from("categories").select("*").order("name").then(({data})=>setList((data as Cat[])??[]));
  useEffect(() => { void load(); }, []);

  const add = async () => {
    if (!newName.trim()) return;
    const { error } = await supabase.from("categories").insert({ name: newName.trim() });
    if (error) { toast.error(error.message); return; }
    setNewName(""); void load();
  };
  const save = async (id: string) => {
    const { error } = await supabase.from("categories").update({ name: editName }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    setEditId(null); void load();
  };
  const del = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) toast.error(error.message); else void load();
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="font-serif text-3xl font-semibold">Categories</h1>
      <div className="flex gap-2">
        <Input value={newName} onChange={(e)=>setNewName(e.target.value)} placeholder="New category name" />
        <Button onClick={add} className="bg-primary hover:bg-primary/90"><Plus size={14} className="mr-1" /> Add</Button>
      </div>
      <div className="rounded-xl border border-border bg-card divide-y divide-border">
        {list.map(c => (
          <div key={c.id} className="flex items-center justify-between p-3">
            {editId === c.id ? (
              <Input value={editName} onChange={(e)=>setEditName(e.target.value)} className="max-w-xs" />
            ) : <div className="font-medium">{c.name}</div>}
            <div className="flex gap-1">
              {editId === c.id ? (
                <>
                  <Button variant="ghost" size="icon" onClick={()=>save(c.id)}><Check size={14} /></Button>
                  <Button variant="ghost" size="icon" onClick={()=>setEditId(null)}><X size={14} /></Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="icon" onClick={()=>{setEditId(c.id); setEditName(c.name);}}><Pencil size={14} /></Button>
                  <Button variant="ghost" size="icon" onClick={()=>del(c.id)}><Trash2 size={14} /></Button>
                </>
              )}
            </div>
          </div>
        ))}
        {list.length === 0 && <div className="p-6 text-center text-muted-foreground">No categories</div>}
      </div>
    </div>
  );
}
