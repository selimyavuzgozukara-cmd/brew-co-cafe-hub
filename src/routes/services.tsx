import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Coffee, GraduationCap, PartyPopper, Package, CalendarHeart, Wrench } from "lucide-react";
import { money } from "@/lib/format";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Brew & Co." },
      { name: "description", content: "Cuppings, workshops, catering, wholesale, subscriptions, and equipment consulting." },
    ],
  }),
  component: ServicesPage,
});

interface Service { id: string; name: string; description: string | null; price: number | null }

const icons = [Coffee, GraduationCap, PartyPopper, Package, CalendarHeart, Wrench];

function ServicesPage() {
  const [services, setServices] = useState<Service[] | null>(null);
  useEffect(() => {
    supabase.from("services").select("*").order("created_at").then(({ data }) => setServices((data as Service[]) ?? []));
  }, []);
  return (
    <>
      <section className="bg-secondary/40 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
          <h1 className="font-serif text-5xl font-semibold">Services</h1>
          <p className="text-muted-foreground mt-2 max-w-xl">Beyond the cup — workshops, catering, and ways to bring great coffee to your space.</p>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services
            ? services.map((s, idx) => {
                const Icon = icons[idx % icons.length];
                return (
                  <div key={s.id} className="p-6 rounded-xl border border-border bg-card hover:shadow-lg transition">
                    <div className="grid place-items-center h-12 w-12 rounded-full bg-accent/20 text-accent mb-4">
                      <Icon size={22} />
                    </div>
                    <h3 className="font-serif text-xl font-semibold">{s.name}</h3>
                    <p className="text-sm text-muted-foreground mt-2">{s.description}</p>
                    {s.price != null && (
                      <div className="mt-4 font-serif text-lg font-semibold">{money(Number(s.price))}</div>
                    )}
                  </div>
                );
              })
            : Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-xl" />)}
        </div>
      </div>
    </>
  );
}
