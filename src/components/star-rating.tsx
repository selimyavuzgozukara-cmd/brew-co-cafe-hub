import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: number;
  size?: number;
  onChange?: (v: number) => void;
  className?: string;
}

export function StarRating({ value, size = 16, onChange, className }: Props) {
  const interactive = !!onChange;
  return (
    <div className={cn("inline-flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= Math.round(value);
        return (
          <button
            key={n}
            type="button"
            disabled={!interactive}
            onClick={() => onChange?.(n)}
            className={cn(
              "transition-transform",
              interactive && "cursor-pointer hover:scale-110",
              !interactive && "cursor-default"
            )}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
          >
            <Star
              size={size}
              className={cn(
                filled ? "fill-accent text-accent" : "fill-transparent text-muted-foreground/40"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
