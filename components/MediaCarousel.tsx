"use client";

import { useEffect, useRef, useState } from "react";

export type MediaItem = {
  src: string;
  type: "image" | "video";
  alt?: string;
};

export default function MediaCarousel({
  items,
  label = "Media gallery",
}: {
  items: MediaItem[];
  label?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const startX = useRef<number | null>(null);

  const goTo = (index: number) => {
    setActiveIndex((index + items.length) % items.length);
  };

  const goNext = () => goTo(activeIndex + 1);
  const goPrevious = () => goTo(activeIndex - 1);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") goNext();
      if (event.key === "ArrowLeft") goPrevious();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  if (items.length === 0) return null;

  return (
    <div
      className="relative h-full w-full overflow-hidden bg-sand"
      aria-label={label}
      role="region"
      onPointerDown={(event) => {
        startX.current = event.clientX;
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerUp={(event) => {
        if (startX.current !== null) {
          const distance = event.clientX - startX.current;
          if (Math.abs(distance) > 40) {
            if (distance < 0) goNext();
            else goPrevious();
          }
        }
        startX.current = null;
      }}
      onPointerCancel={() => {
        startX.current = null;
      }}
      style={{ cursor: "grab" }}
    >
      <div
        className="flex h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {items.map((item, index) => (
          <div key={`${item.src}-${index}`} className="h-full w-full shrink-0">
            {item.type === "video" ? (
              <video
                className="block h-full w-full object-cover"
                autoPlay={index === activeIndex}
                muted
                loop
                playsInline
                aria-label={item.alt ?? `${label} ${index + 1}`}
              >
                <source src={item.src} type="video/mp4" />
              </video>
            ) : (
              <img
                src={item.src}
                alt={item.alt ?? ""}
                className="block h-full w-full object-cover"
                draggable={false}
              />
            )}
          </div>
        ))}
      </div>

      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrevious}
            aria-label="Previous media"
            className="absolute left-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center bg-ivory/80 text-ink backdrop-blur-sm transition hover:bg-ivory md:flex"
          >
            <span aria-hidden="true">&#8592;</span>
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next media"
            className="absolute right-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center bg-ivory/80 text-ink backdrop-blur-sm transition hover:bg-ivory md:flex"
          >
            <span aria-hidden="true">&#8594;</span>
          </button>
          <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-ivory/55 px-3 py-2 backdrop-blur-sm">
            {items.map((item, index) => (
              <button
                key={`${item.src}-dot-${index}`}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Go to media ${index + 1}`}
                aria-current={index === activeIndex ? "true" : undefined}
                className={`h-2.5 w-2.5 rounded-full border border-ink/30 transition ${
                  index === activeIndex ? "bg-ink" : "bg-ink/20 hover:bg-ink/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}