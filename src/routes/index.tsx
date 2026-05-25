import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { ProductDetailModal } from "@/components/product-detail-modal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Coffee, Leaf, Award } from "lucide-react";
import { money } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Brew & Co. — Küçük parti kahveler, sakin sabahlar" },
      { name: "description", content: "Espresso, filtre kahve, hamur işleri ve sıcak bir karşılama sunan mahalle kavurma evi." },
    ],
  }),
  component: Home,
});

interface Service { id: string; name: string; description: string | null; price: number | null }

function Home() {
  const [products, setProducts] = useState<ProductCardData[] | null>(null);
  const [services, setServices] = useState<Service[] | null>(null);
  const [openProduct, setOpenProduct] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const [{ data: p }, { data: s }] = await Promise.all([
        supabase.from("products").select("id,name,description,price,stock_quantity, categories(name)").eq("is_active", true).limit(4),
        supabase.from("services").select("*").limit(3),
      ]);
      setProducts(
        (p ?? []).map((row) => ({
          id: row.id, name: row.name, description: row.description,
          price: Number(row.price), stock_quantity: row.stock_quantity,
          category_name: (row as { categories?: { name: string } | null }).categories?.name ?? null,
        }))
      );
      setServices((s as Service[]) ?? []);
    })();
  }, []);

  return (
    <>
      <section className="hero-gradient bg-grain">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-24 md:py-32 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/80 backdrop-blur text-xs font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Yeni Bahar Kavurması geldi
            </span>
            <h1 className="mt-4 text-5xl md:text-7xl font-serif font-semibold leading-[1.05]">
              Kahve, <em className="text-accent not-italic">yavaşça</em> hazırlanır, içtenlikle sunulur.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-md">
              Küçük partiler hâlinde, mekânımızda kavrulan çekirdekler. Sabah 7'de fırından çıkan hamur işleri. Sizi bekleyen bir köşe masası.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                <Link to="/products">Menüyü Keşfet <ArrowRight size={16} className="ml-1" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/services">Hizmetlerimiz</Link>
              </Button>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="aspect-square rounded-full bg-primary/90 grid place-items-center shadow-2xl">
              <Coffee className="text-primary-foreground" size={120} strokeWidth={1} />
            </div>
            <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-accent grid place-items-center font-serif text-3xl text-accent-foreground rotate-12">
              ☕
            </div>
            <div className="absolute -bottom-6 -left-6 px-4 py-3 rounded-2xl bg-card border border-border shadow-lg">
              <div className="text-xs text-muted-foreground">Bugünün kavurması</div>
              <div className="font-serif text-lg font-semibold">Etiyopya Yirgacheffe</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { icon: Leaf, title: "Tek menşeli", text: "Her mevsim doğrudan küçük çiftliklerden tedarik edilir." },
            { icon: Coffee, title: "Mekânda kavrulur", text: "Taze partiler her hafta dükkânın üstünde kavrulur." },
            { icon: Award, title: "Ödüllü baristalar", text: "Beklemeye değer bir espresso çekmek için eğitildiler." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="p-6 rounded-xl border border-border bg-card">
              <Icon className="text-accent mb-3" />
              <h3 className="font-serif text-lg font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-serif text-4xl font-semibold">Öne çıkan menü</h2>
            <p className="text-muted-foreground mt-1">Bugün tezgâhımızdan birkaç favori.</p>
          </div>
          <Button asChild variant="ghost"><Link to="/products">Tümünü gör <ArrowRight size={14} className="ml-1" /></Link></Button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products
            ? products.map((p) => <ProductCard key={p.id} product={p} onOpen={setOpenProduct} />)
            : Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-80 rounded-xl" />)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-serif text-4xl font-semibold">Fincanın ötesinde</h2>
            <p className="text-muted-foreground mt-1">Atölyeler, ikram hizmetleri ve daha fazlası.</p>
          </div>
          <Button asChild variant="ghost"><Link to="/services">Tüm hizmetler <ArrowRight size={14} className="ml-1" /></Link></Button>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {services
            ? services.map((s) => (
                <div key={s.id} className="p-6 rounded-xl border border-border bg-card hover:shadow-lg transition">
                  <div className="grid place-items-center h-12 w-12 rounded-full bg-secondary mb-4">
                    <Coffee className="text-primary" size={20} />
                  </div>
                  <h3 className="font-serif text-xl font-semibold">{s.name}</h3>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{s.description}</p>
                  {s.price && <div className="mt-3 font-serif text-lg">{money(Number(s.price))}</div>}
                </div>
              ))
            : Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      </section>

      <ProductDetailModal productId={openProduct} onClose={() => setOpenProduct(null)} />
    </>
  );
}
