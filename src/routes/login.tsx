import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coffee } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Giriş Yap — Brew & Co." }] }),
  component: LoginPage,
});

function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) { toast.error(error); return; }
    toast.success("Tekrar hoş geldiniz!");
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-[80vh] grid place-items-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary text-primary-foreground grid place-items-center mb-3"><Coffee /></div>
          <h1 className="font-serif text-3xl font-semibold">Tekrar hoş geldiniz</h1>
          <p className="text-sm text-muted-foreground mt-1">Brew &amp; Co. hesabınıza giriş yapın.</p>
        </div>
        <form onSubmit={onSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
          <div>
            <Label htmlFor="email">E-posta</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </div>
          <div>
            <Label htmlFor="password">Şifre</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </div>
          <Button type="submit" disabled={submitting} className="w-full bg-primary hover:bg-primary/90">
            {submitting ? "Giriş yapılıyor…" : "Giriş yap"}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Yeni misiniz? <Link to="/signup" className="font-medium text-foreground underline">Hesap oluşturun</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
