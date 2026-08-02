import { useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function Lightbox({ images, index, onClose }) {
  const total = images.length;

  const prev = (e) => {
    e?.stopPropagation();
    onClose((index - 1 + total) % total);
  };

  const next = (e) => {
    e?.stopPropagation();
    onClose((index + 1) % total);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose(null);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, total]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 cursor-zoom-out"
      onClick={() => onClose(null)}
    >
      <button
        onClick={() => onClose(null)}
        className="absolute top-4 right-4 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 transition-colors"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      {total > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      <figure className="max-h-full max-w-full" onClick={(e) => e.stopPropagation()}>
        <img
          src={images[index]?.url}
          alt={images[index]?.text || "Full size image"}
          className="max-h-[82vh] max-w-full object-contain rounded-lg cursor-default"
        />
        {images[index]?.text && (
          <figcaption className="text-center text-sm text-zinc-300 mt-3">
            {images[index].text}
          </figcaption>
        )}
        {total > 1 && (
          <p className="text-center text-xs text-zinc-500 mt-1">
            {index + 1} / {total} · use ← → keys
          </p>
        )}
      </figure>
    </div>
  );
}
