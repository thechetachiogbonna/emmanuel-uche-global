"use client";

import { useRef, useState } from "react";

export type MediaItem = {
  src: string;
  type: "image" | "video";
  alt?: string;
};

export default function MediaCarousel({
  items,
  label = "Media gallery",
  variant = "editorial",
}: {
  items: MediaItem[];
  label?: string;
  variant?: "editorial" | "product";
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const startX = useRef<number | null>(null);
  const slides = items.filter((item) => item.src.trim());
  const currentIndex = Math.min(activeIndex, slides.length - 1);

  const goTo = (index: number) => {
    setActiveIndex((index + slides.length) % slides.length);
  };

  const goNext = () => goTo(currentIndex + 1);
  const goPrevious = () => goTo(currentIndex - 1);

  if (slides.length === 0) return null;

  return (
    <div
      className={`group/media relative h-full w-full overflow-hidden ${
        variant === "product" ? "bg-sand" : "bg-ivory p-2.5"
      }`}
      aria-label={`${label}, ${currentIndex + 1} of ${slides.length}`}
      role="region"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") goNext();
        if (event.key === "ArrowLeft") goPrevious();
      }}
      onPointerDown={(event) => {
        if (event.target instanceof Element && event.target.closest("button")) {
          return;
        }
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
      {slides.map((item, index) => (
          <div
            key={`${item.src}-${index}`}
            aria-hidden={index !== currentIndex}
            className="absolute inset-0 h-full w-full transition-transform duration-500 ease-out"
            style={{ transform: `translateX(${(index - currentIndex) * 100}%)` }}
          >
            {item.type === "video" ? (
              <video
                className={`block h-full w-full ${variant === "product" ? "object-contain" : "object-cover"}`}
                autoPlay={index === currentIndex}
                muted
                loop
                playsInline
                aria-label={item.alt ?? `${label} ${index + 1}`}
              >
                <source
                  src={item.src}
                  type={item.src.toLowerCase().includes(".webm") ? "video/webm" : item.src.toLowerCase().includes(".mov") ? "video/quicktime" : "video/mp4"}
                />
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

      {slides.length > 1 && (
        <>
          {variant === "product" && (
            <>
              <button
                type="button"
                onClick={goPrevious}
                aria-label={`Previous ${label} media`}
                className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-black opacity-0 transition-opacity hover:opacity-60 group-hover/media:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m0 0 7 7m-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label={`Next ${label} media`}
                className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-black opacity-0 transition-opacity hover:opacity-60 group-hover/media:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m0 0-7-7m7 7-7 7" />
                </svg>
              </button>
            </>
          )}
          <div className={`absolute left-1/2 flex max-w-[calc(100%-1rem)] -translate-x-1/2 items-center gap-2 ${variant === "product" ? "bottom-3" : "bottom-10"}`}>
            <div className="flex min-w-0 items-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
            {slides.map((item, index) => (
              <button
                key={`${item.src}-dot-${index}`}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Go to media ${index + 1} of ${slides.length}`}
                aria-current={index === currentIndex ? "true" : undefined}
                className={`${variant === "product" ? "h-2 w-2" : "h-2.5 w-2.5"} rounded-full border-0 transition ${
                  index === currentIndex ? "bg-black" : "bg-black/30 hover:bg-black/60"
                }`}
              />
            ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}