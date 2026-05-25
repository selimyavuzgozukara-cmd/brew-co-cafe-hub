import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StarRating } from "./star-rating";
import { money } from "@/lib/format";
import { useCart } from "@/lib/cart-context";
import { toast } from "sonner";

export interface ProductCardData {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  category_name?: string | null;
  avg_rating?: number;
  review_count?: number;
}

export function ProductCard({ product, onOpen }: { product: ProductCardData; onOpen: (id: string) => void }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const out = product.stock_quantity <= 0;

  return (
    <div className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow">
      <button onClick={() => onOpen(product.id)}
        className="aspect-[4/3] relative bg-gradient-to-br from-secondary to-accent/30 grid place-items-center overflow-hidden">
        <span className="font-serif text-5xl text-primary/30 group-hover:scale-110 transition-transform">
          {product.name.charAt(0)}
        </span>
        {out && (
          <span className="absolute top-2 right-2 px-2 py-1 rounded-full bg-destructive text-destructive-foreground text-xs font-semibold">
            Tükendi
          </span>
        )}
        {product.category_name && (
          <span className="absolute top-2 left-2 px-2 py-1 rounded-full bg-background/80 backdrop-blur text-xs font-medium">
            {product.category_name}
          </span>
        )}
      </button>

      <div className="p-4 flex flex-col flex-1">
        <button onClick={() => onOpen(product.id)} className="text-left">
          <h3 className="font-serif text-lg font-semibold leading-tight">{product.name}</h3>
        </button>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{product.description}</p>

        <div className="mt-2 flex items-center gap-2 text-sm">
          <StarRating value={product.avg_rating ?? 0} size={14} />
          <span className="text-muted-foreground">({product.review_count ?? 0})</span>
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between">
          <div className="font-serif text-xl font-semibold tabular-nums">{money(product.price)}</div>
          <div className="inline-flex items-center rounded-md border border-border">
            <button className="px-2 py-1 hover:bg-muted disabled:opacity-50" disabled={out || qty <= 1} onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Azalt"><Minus size={14} /></button>
            <span className="px-2 text-sm tabular-nums w-6 text-center">{qty}</span>
            <button className="px-2 py-1 hover:bg-muted disabled:opacity-50" disabled={out || qty >= product.stock_quantity} onClick={() => setQty((q) => q + 1)} aria-label="Arttır"><Plus size={14} /></button>
          </div>
        </div>

        <Button
          disabled={out}
          onClick={() => {
            add({ id: product.id, name: product.name, price: product.price, stock: product.stock_quantity }, qty);
            toast.success(`${qty} × ${product.name} sepete eklendi`);
          }}
          className="mt-3 w-full bg-primary hover:bg-primary/90 disabled:opacity-50"
        >
          {out ? "Tükendi" : "Sepete ekle"}
        </Button>
      </div>
    </div>
  );
}
