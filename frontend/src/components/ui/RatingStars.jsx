import { useState } from "react";
import { Star } from "lucide-react";

export default function RatingStars({ value = 0, size = 24, interactive = false, disabled = false, onChange, className = "" }) {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <div
      className={`flex items-center gap-1 ${className}`}
      onMouseLeave={() => setHover(0)}
      role="radiogroup"
      aria-label="Rating"
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!interactive || disabled}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => interactive && !disabled && setHover(n)}
          className={
            interactive && !disabled
              ? "cursor-pointer transition-transform hover:scale-115 active:scale-95"
              : "cursor-default"
          }
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
        >
          <Star
            style={{ width: size, height: size }}
            className={n <= display ? "text-amber-400 fill-amber-400" : "text-zinc-600"}
          />
        </button>
      ))}
    </div>
  );
}
