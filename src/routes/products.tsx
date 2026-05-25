import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { ProductDetailModal } from "@/components/product-detail-modal";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Menü — Brew & Co." },
      { name: "description", content: "Espresso, demlemelerimiz, özel içeceklerimiz, hamur işlerimiz ve soğuk içeceklerimize göz atın." },
    ],
  }),
  component: ProductsPage,
});

interface Category { id: string; name: string }

interface RawProduct {
  id: string; name: string; description: string | null;
  price: number; stock_quantity: number;
  categories: { name: string } | null;
}

function ProductsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductCardData[] | null>(null);
  const [ratings, setRatings] = useState<Record<string, { avg: number; count: number }>>({});
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [sort, setSort] = useState<string>("name-asc");
  const [openProduct, setOpenProduct] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    supabase.from("categories").select("id,name").order("name").then(({ data }) => setCategories((data as Category[]) ?? []));
  }, []);

  useEffect(() => {
    void (async () => {
      setProducts(null);
      let q = supabase
        .from("products")
        .select("id,name,description,price,stock_quantity, categories(name)")
        .eq("is_active", true);
      if (cat !== "all") q = q.eq("category_id", cat);
      if (debounced) q = q.ilike("name", `%${debounced}%`);
      const [field, dir] = sort.split("-");
      q = q.order(field, { ascending: dir === "asc" });
      const { data } = await q;
      const rows = (data as RawProduct[] | null) ?? [];
      setProducts(
        rows.map((row) => ({
          id: row.id, name: row.name, description: row.description,
          price: Number(row.price), stock_quantity: row.stock_quantity,
          category_name: row.categories?.name ?? null,
        }))
      );

      if (rows.length) {
        const { data: reviews } = await supabase
          .from("reviews")
          .select("product_id,rating")
          .in("product_id", rows.map((r) => r.id))
          .eq("status", "approved");
        const agg: Record<string, { sum: number; count: number }> = {};
        (reviews ?? []).forEach((r: { product_id: string; rating: number }) => {
          if (!agg[r.product_id]) agg[r.product_id] = { sum: 0, count: 0 };
          agg[r.product_id].sum += r.rating;
          agg[r.product_id].count += 1;
        });
        const map: Record<string, { avg: number; count: number }> = {};
        for (const k in agg) map[k] = { avg: agg[k].sum / agg[k].count, count: agg[k].count };
        setRatings(map);
      } else {
        setRatings({});
      }
    })();
  }, [cat, debounced, sort]);

  const enriched = useMemo(
    () => products?.map((p) => ({ ...p, avg_rating: ratings[p.id]?.avg ?? 0, review_count: ratings[p.id]?.count ?? 0 })),
    [products, ratings]
  );

  return (
    <>
      <section className="bg-secondary/40 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
          <h1 className="font-serif text-5xl font-semibold">Menümüz</h1>
          <p className="text-muted-foreground mt-2 max-w-xl">Özenle seçilmiş çekirdekler, ilhamla demlenmiş kahveler. Her sabah mekânımızda pişen hamur işleri.</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Menüde ara…" className="pl-9" />
          </div>
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Kategori" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm kategoriler</SelectItem>
              {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Sırala" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">İsim A → Z</SelectItem>
              <SelectItem value="price-asc">Fiyat: Düşük → Yüksek</SelectItem>
              <SelectItem value="price-desc">Fiyat: Yüksek → Düşük</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {enriched === undefined ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-80 rounded-xl" />)}
          </div>
        ) : enriched.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-xl">
            <p className="font-serif text-2xl">Sonuç bulunamadı</p>
            <p className="text-muted-foreground mt-1">Farklı bir arama veya kategori deneyin.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {enriched.map((p) => <ProductCard key={p.id} product={p} onOpen={setOpenProduct} />)}
          </div>
        )}
      </div>

      <ProductDetailModal productId={openProduct} onClose={() => setOpenProduct(null)} />
    </>
  );
}
