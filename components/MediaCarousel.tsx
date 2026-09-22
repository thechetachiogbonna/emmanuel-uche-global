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

  const goTo = (index: number) => {
    setActiveIndex((index + items.length) % items.length);
  };

  const goNext = () => goTo(activeIndex + 1);
  const goPrevious = () => goTo(activeIndex - 1);

  if (items.length === 0) return null;

  return (
    <div
      className={`group/media relative h-full w-full overflow-hidden ${
        variant === "product" ? "bg-sand" : "bg-ivory p-2.5"
      }`}
      aria-label={label}
      role="region"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") goNext();
        if (event.key === "ArrowLeft") goPrevious();
      }}
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
        className="flex h-full overflow-hidden transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {items.map((item, index) => (
          <div key={`${item.src}-${index}`} className="h-full w-full shrink-0">
            {item.type === "video" ? (
              <video
                className={`block h-full w-full ${variant === "product" ? "object-contain" : "object-cover"}`}
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
          <div className={`absolute left-1/2 flex -translate-x-1/2 items-center ${variant === "product" ? "bottom-4 gap-1.5" : "bottom-12 gap-2"}`}>
            {items.map((item, index) => (
              <button
                key={`${item.src}-dot-${index}`}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Go to media ${index + 1}`}
                aria-current={index === activeIndex ? "true" : undefined}
                className={`${variant === "product" ? "h-2 w-2" : "h-2.5 w-2.5"} rounded-full border-0 transition ${
                  index === activeIndex ? "bg-black" : "bg-black/30 hover:bg-black/60"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}