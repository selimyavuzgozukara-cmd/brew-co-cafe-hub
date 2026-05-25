import { createFileRoute } from "@tanstack/react-router";
import { Protected } from "@/components/protected";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { dateShort } from "@/lib/format";
import { toast } from "sonner";
import { OrdersPage } from "./orders";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "Hesabım — Brew & Co." }] }),
  component: () => <Protected><AccountPage /></Protected>,
});

function AccountPage() {
  const { user, profile, refresh } = useAuth();
  const [firstName, setFirstName] = useState(profile?.first_name ?? "");
  const [lastName, setLastName] = useState(profile?.last_name ?? "");
  const [email, setEmail] = useState(profile?.email ?? user?.email ?? "");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const initials = `${profile?.first_name?.[0] ?? ""}${profile?.last_name?.[0] ?? ""}`.toUpperCase() || "B";

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      first_name: firstName, last_name: lastName, email,
    }).eq("id", user.id);
    if (!error && (email !== user.email || password)) {
      const updates: { email?: string; password?: string } = {};
      if (email !== user.email) updates.email = email;
      if (password) updates.password = password;
      const { error: authErr } = await supabase.auth.updateUser(updates);
      if (authErr) { setSaving(false); toast.error(authErr.message); return; }
    }
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Profil güncellendi");
    setPassword("");
    void refresh();
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 grid md:grid-cols-[280px_1fr] gap-8">
      <aside className="md:sticky md:top-20 h-fit rounded-2xl border border-border bg-card p-6 text-center">
        <div className="mx-auto h-20 w-20 rounded-full bg-accent text-accent-foreground grid place-items-center font-serif text-2xl font-semibold">
          {initials}
        </div>
        <div className="mt-3 font-serif text-xl">{profile?.first_name} {profile?.last_name}</div>
        <div className="text-sm text-muted-foreground truncate">{profile?.email ?? user?.email}</div>
        {profile && <div className="text-xs text-muted-foreground mt-2">Üyelik: {dateShort(profile.created_at)}</div>}
      </aside>

      <div>
        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Profil bilgileri</TabsTrigger>
            <TabsTrigger value="orders">Siparişlerim</TabsTrigger>
          </TabsList>
          <TabsContent value="profile" className="mt-4">
            <form onSubmit={saveProfile} className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><Label htmlFor="f">Ad</Label><Input id="f" value={firstName} onChange={(e)=>setFirstName(e.target.value)} /></div>
                <div><Label htmlFor="l">Soyad</Label><Input id="l" value={lastName} onChange={(e)=>setLastName(e.target.value)} /></div>
              </div>
              <div><Label htmlFor="e">E-posta</Label><Input id="e" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} /></div>
              <div>
                <Label htmlFor="p">Yeni şifre</Label>
                <Input id="p" type="password" placeholder="Değiştirmemek için boş bırakın" value={password} onChange={(e)=>setPassword(e.target.value)} />
              </div>
              <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90">{saving ? "Kaydediliyor…" : "Değişiklikleri kaydet"}</Button>
            </form>
          </TabsContent>
          <TabsContent value="orders" className="mt-4">
            <div className="-mx-4 sm:-mx-6"><OrdersPage /></div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
