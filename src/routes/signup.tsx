import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coffee } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Hesap Oluştur — Brew & Co." }] }),
  component: SignupPage,
});

const schema = z.object({
  firstName: z.string().trim().min(1, "Zorunlu alan").max(50),
  lastName: z.string().trim().min(1, "Zorunlu alan").max(50),
  email: z.string().trim().email("Geçersiz e-posta").max(255),
  password: z.string().min(6, "En az 6 karakter").max(72),
});

function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { errs[String(i.path[0])] = i.message; });
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    const { error } = await signUp(parsed.data);
    setSubmitting(false);
    if (error) { toast.error(error); return; }
    toast.success("Hesabınız oluşturuldu! Onaylamak için e-postanızı kontrol edin.");
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-[80vh] grid place-items-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary text-primary-foreground grid place-items-center mb-3"><Coffee /></div>
          <h1 className="font-serif text-3xl font-semibold">Brew &amp; Co.'ya katılın</h1>
          <p className="text-sm text-muted-foreground mt-1">Sipariş vermek ve yorum yapmak için bir hesap oluşturun.</p>
        </div>
        <form onSubmit={onSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="first">Ad</Label>
              <Input id="first" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
              {errors.firstName && <p className="text-xs text-destructive mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <Label htmlFor="last">Soyad</Label>
              <Input id="last" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
              {errors.lastName && <p className="text-xs text-destructive mt-1">{errors.lastName}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="email">E-posta</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>
          <div>
            <Label htmlFor="password">Şifre</Label>
            <Input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" />
            {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
          </div>
          <Button type="submit" disabled={submitting} className="w-full bg-primary hover:bg-primary/90">
            {submitting ? "Hesap oluşturuluyor…" : "Hesap oluştur"}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Zaten hesabınız var mı? <Link to="/login" className="font-medium text-foreground underline">Giriş yap</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
