import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { StarRating } from "./star-rating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { money, dateShort } from "@/lib/format";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  status: string;
  profiles?: { first_name: string | null; last_name: string | null } | null;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  is_active: boolean;
  category_id: string | null;
}

export function ProductDetailModal({ productId, onClose }: { productId: string | null; onClose: () => void }) {
  const { user } = useAuth();
  const open = !!productId;
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    Promise.all([
      supabase.from("products").select("*").eq("id", productId).single(),
      supabase.from("reviews").select("*, profiles(first_name,last_name)").eq("product_id", productId).order("created_at", { ascending: false }),
    ]).then(([p, r]) => {
      setProduct((p.data as Product) ?? null);
      setReviews((r.data as Review[]) ?? []);
      setLoading(false);
    });
  }, [productId]);

  const avg = reviews.filter((r) => r.status === "approved").reduce((s, r, _, a) => s + r.rating / a.length, 0);

  const submitReview = async () => {
    if (!user || !productId) return;
    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      user_id: user.id, product_id: productId, rating, comment, status: "pending",
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Thanks! Your review is pending approval.");
    setComment("");
    setRating(5);
    const { data } = await supabase.from("reviews").select("*, profiles(first_name,last_name)").eq("product_id", productId).order("created_at", { ascending: false });
    setReviews((data as Review[]) ?? []);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {loading || !product ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">{product.name}</DialogTitle>
              <DialogDescription>{product.description}</DialogDescription>
            </DialogHeader>

            <div className="flex items-center justify-between border-y border-border py-3">
              <div className="font-serif text-2xl font-semibold">{money(product.price)}</div>
              <div className="text-sm">
                {product.stock_quantity > 0
                  ? <span className="text-muted-foreground">{product.stock_quantity} in stock</span>
                  : <span className="text-destructive font-medium">Out of stock</span>}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Reviews</h3>
                <div className="flex items-center gap-2"><StarRating value={avg} /><span className="text-sm text-muted-foreground">({reviews.filter(r=>r.status==='approved').length})</span></div>
              </div>

              {user ? (
                <div className="rounded-lg border border-border p-3 bg-muted/30 mb-4">
                  <p className="text-sm font-medium mb-2">Leave a review</p>
                  <StarRating value={rating} onChange={setRating} />
                  <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your thoughts…" className="mt-2" />
                  <Button onClick={submitReview} disabled={submitting} size="sm" className="mt-2 bg-primary hover:bg-primary/90">
                    {submitting ? "Submitting…" : "Submit review"}
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mb-4">Log in to leave a review.</p>
              )}

              <div className="space-y-3">
                {reviews.filter(r=>r.status==='approved').length === 0 && (
                  <p className="text-sm text-muted-foreground">No reviews yet. Be the first.</p>
                )}
                {reviews.filter(r=>r.status==='approved').map((r) => (
                  <div key={r.id} className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm">
                        {r.profiles?.first_name ?? "Customer"} {r.profiles?.last_name ?? ""}
                      </div>
                      <span className="text-xs text-muted-foreground">{dateShort(r.created_at)}</span>
                    </div>
                    <StarRating value={r.rating} size={12} className="mt-1" />
                    {r.comment && <p className="text-sm text-muted-foreground mt-1">{r.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
