import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dateShort } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({ component: AdminUsers });

interface Row {
  id: string; first_name: string | null; last_name: string | null; email: string | null; created_at: string;
  role: "admin" | "user";
}

function AdminUsers() {
  const [list, setList] = useState<Row[]>([]);

  const load = async () => {
    const [{ data: profs }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id,role"),
    ]);
    const roleMap = new Map<string, "admin" | "user">();
    (roles ?? []).forEach((r: { user_id: string; role: "admin" | "user" }) => {
      if (r.role === "admin" || roleMap.get(r.user_id) !== "admin") roleMap.set(r.user_id, r.role);
    });
    setList((profs ?? []).map((p) => ({ ...p, role: roleMap.get(p.id) ?? "user" } as Row)));
  };
  useEffect(() => { void load(); }, []);

  const setRole = async (userId: string, role: "admin" | "user") => {
    await supabase.from("user_roles").delete().eq("user_id", userId);
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
    if (error) toast.error(error.message); else { toast.success("Rol güncellendi"); void load(); }
  };

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-3xl font-semibold">Kullanıcılar</h1>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left"><tr><th className="p-3">İsim</th><th>E-posta</th><th>Kayıt</th><th>Rol</th></tr></thead>
          <tbody>
            {list.map(u => (
              <tr key={u.id} className="border-t border-border">
                <td className="p-3 font-medium">{u.first_name} {u.last_name}</td>
                <td className="text-muted-foreground">{u.email}</td>
                <td>{dateShort(u.created_at)}</td>
                <td>
                  <Select value={u.role} onValueChange={(v)=>setRole(u.id, v as "admin"|"user")}>
                    <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="user">Kullanıcı</SelectItem><SelectItem value="admin">Yönetici</SelectItem></SelectContent>
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
