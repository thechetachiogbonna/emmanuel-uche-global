"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const NAME = "Uche";
const SUBTITLE = "FASHION INTERNATIONAL";

/** Per-letter typing delays (ms) — gives "Uche" a hand-typed rhythm */
const NAME_DELAYS = [150, 110, 90, 130];
const SUBTITLE_BASE = 55;
const subtitleDelay = (i: number) =>
  SUBTITLE_BASE + (i % 4 === 0 ? 25 : i % 3 === 0 ? -10 : 0);

const PAUSE_MS = 300; // the "Enter key" beat between lines
const HOLD_MS = 450; // pause once fully typed, before exiting
const EXIT_MS = 800; // overlay clears / page resolves

type Phase =
  | "typing-name"
  | "pause"
  | "typing-subtitle"
  | "hold"
  | "exit"
  | "done";

const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3);
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

function TypedChar({ char }: { char: string }) {
  return <span className="intro-char">{char === " " ? "\u00A0" : char}</span>;
}

export default function IntroLoader({
  children,
}: {
  children: React.ReactNode;
}) {
  // Cumulative typed-time tables: "how many letters have appeared by time t".
  const nameCumulative = useMemo(
    () =>
      NAME_DELAYS.map((_, i) =>
        NAME_DELAYS.slice(0, i + 1).reduce((a, b) => a + b, 0)
      ),
    []
  );
  const subtitleCumulative = useMemo(
    () =>
      Array.from({ length: SUBTITLE.length }, (_, i) =>
        Array.from({ length: i + 1 }, (_, j) => subtitleDelay(j)).reduce(
          (a, b) => a + b,
          0
        )
      ),
    []
  );

  const NAME_TOTAL = nameCumulative[nameCumulative.length - 1];
  const SUBTITLE_START = NAME_TOTAL + PAUSE_MS;
  const SUBTITLE_TOTAL = subtitleCumulative[subtitleCumulative.length - 1];
  const TYPE_END = SUBTITLE_START + SUBTITLE_TOTAL;
  const HOLD_END = TYPE_END + HOLD_MS;
  const TOTAL = HOLD_END + EXIT_MS;

  // One continuous timeline the whole reveal interpolates across —
  // no CSS transitions to restart mid-flight, just a single smooth curve.
  const keyframes = useMemo(
    () => [
      { t: 0, overlay: 1, cOpacity: 0, cY: 18, oScale: 1 },
      { t: NAME_TOTAL, overlay: 0.9, cOpacity: 0.12, cY: 15, oScale: 1 },
      { t: SUBTITLE_START, overlay: 0.84, cOpacity: 0.18, cY: 14, oScale: 1 },
      { t: TYPE_END, overlay: 0.4, cOpacity: 0.72, cY: 6, oScale: 1 },
      { t: HOLD_END, overlay: 0.2, cOpacity: 0.9, cY: 2, oScale: 1 },
      { t: TOTAL, overlay: 0, cOpacity: 1, cY: 0, oScale: 0.94 },
    ],
    [NAME_TOTAL, SUBTITLE_START, TYPE_END, HOLD_END, TOTAL]
  );

  const interpolate = (elapsed: number) => {
    let i = 0;
    while (i < keyframes.length - 2 && elapsed > keyframes[i + 1].t) i++;
    const a = keyframes[i];
    const b = keyframes[i + 1];
    const span = b.t - a.t || 1;
    const p = easeOutCubic(Math.min(1, Math.max(0, (elapsed - a.t) / span)));
    return {
      overlay: lerp(a.overlay, b.overlay, p),
      cOpacity: lerp(a.cOpacity, b.cOpacity, p),
      cY: lerp(a.cY, b.cY, p),
      oScale: lerp(a.oScale, b.oScale, p),
    };
  };

  const [phase, setPhase] = useState<Phase>("typing-name");
  const [nameChars, setNameChars] = useState<string[]>([]);
  const [subtitleChars, setSubtitleChars] = useState<string[]>([]);
  const [lineDrawn, setLineDrawn] = useState(false);
  const [visual, setVisual] = useState(keyframes[0]);

  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const lastNameCount = useRef(0);
  const lastSubCount = useRef(0);
  const lastPhase = useRef<Phase>("typing-name");
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [mountedOverlay, setMountedOverlay] = useState(true);

  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync on mount for a11y preference, not a cascading update
      setNameChars(NAME.split(""));
      setSubtitleChars(SUBTITLE.split(""));
      setLineDrawn(true);
      setVisual(keyframes[keyframes.length - 1]);
      setPhase("done");
      setMountedOverlay(false);
      return;
    }

    document.body.style.overflow = "hidden";

    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;

      // ---- phase ----
      let nextPhase: Phase;
      if (elapsed < NAME_TOTAL) nextPhase = "typing-name";
      else if (elapsed < SUBTITLE_START) nextPhase = "pause";
      else if (elapsed < TYPE_END) nextPhase = "typing-subtitle";
      else if (elapsed < HOLD_END) nextPhase = "hold";
      else if (elapsed < TOTAL) nextPhase = "exit";
      else nextPhase = "done";

      if (nextPhase !== lastPhase.current) {
        lastPhase.current = nextPhase;
        setPhase(nextPhase);
        if (nextPhase === "typing-subtitle") setLineDrawn(false);
      }

      // ---- typed character counts, driven off the same clock ----
      let nameCount = 0;
      while (
        nameCount < nameCumulative.length &&
        elapsed >= nameCumulative[nameCount]
      ) {
        nameCount++;
      }
      if (nameCount !== lastNameCount.current) {
        lastNameCount.current = nameCount;
        setNameChars(NAME.slice(0, nameCount).split(""));
      }

      let subCount = 0;
      if (elapsed >= SUBTITLE_START) {
        const subElapsed = elapsed - SUBTITLE_START;
        while (
          subCount < subtitleCumulative.length &&
          subElapsed >= subtitleCumulative[subCount]
        ) {
          subCount++;
        }
      }
      if (subCount !== lastSubCount.current) {
        lastSubCount.current = subCount;
        setSubtitleChars(SUBTITLE.slice(0, subCount).split(""));
        if (subCount === SUBTITLE.length) setLineDrawn(true);
      }

      // ---- smooth visual interpolation, applied directly (no CSS transition) ----
      const v = interpolate(elapsed);
      if (overlayRef.current) {
        overlayRef.current.style.opacity = String(v.overlay);
        overlayRef.current.style.transform = `scale(${v.oScale})`;
      }
      if (contentRef.current) {
        contentRef.current.style.opacity = String(v.cOpacity);
        contentRef.current.style.transform = `translateY(${v.cY}px)`;
      }

      if (nextPhase === "done") {
        document.body.style.overflow = "";
        setMountedOverlay(false);
        rafRef.current = null;
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showNameCaret = phase === "typing-name" || phase === "pause";
  const showSubtitleCaret = phase === "typing-subtitle";
  const overlayInteractive = phase !== "exit" && phase !== "done";

  return (
    <>
      {mountedOverlay && (
        <div
          ref={overlayRef}
          className="intro-overlay fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ivory overflow-hidden px-6"
          style={{
            opacity: visual.overlay,
            transform: `scale(${visual.oScale})`,
            pointerEvents: overlayInteractive ? "auto" : "none",
            willChange: "opacity, transform",
          }}
          aria-hidden={!overlayInteractive}
        >
          {/* faint ghost wordmark for depth */}
          <span
            className="watermark-u absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[42vw] md:text-[26rem] whitespace-nowrap not-italic font-black"
            aria-hidden
          >
            Uche
          </span>

          <div className="relative z-10 flex flex-col items-center">
            {/* Line 1 — brand name */}
            <div className="flex items-baseline">
              <span className="font-display font-black text-ink text-[19vw] md:text-[7.5rem] leading-[0.85] tracking-tight">
                {nameChars.map((char, i) => (
                  <TypedChar key={`n-${i}`} char={char} />
                ))}
              </span>
              {showNameCaret && (
                <span className="intro-caret ml-1 md:ml-3 w-[4px] md:w-[6px] h-[14vw] md:h-[5.6rem] bg-clay inline-block rounded-[1px]" />
              )}
            </div>

            {/* Line 2 — bold subtitle, "pressed enter" onto new line */}
            <div className="flex items-baseline mt-1 md:mt-2 min-h-[7vw] md:min-h-[2.6rem]">
              <span className="font-display font-bold uppercase text-clay text-[5.6vw] md:text-[2.35rem] leading-none tracking-[0.02em]">
                {subtitleChars.map((char, i) => (
                  <TypedChar key={`s-${i}`} char={char} />
                ))}
              </span>
              {showSubtitleCaret && (
                <span className="intro-caret ml-1 md:ml-2 w-[3px] md:w-[4px] h-[5vw] md:h-[2rem] bg-clay inline-block rounded-[1px]" />
              )}
            </div>

            {/* accent underline draws in once typing is done */}
            <div
              className="mt-5 md:mt-7 h-px w-14 md:w-20 bg-ink/25 origin-left"
              style={{
                transform: lineDrawn ? "scaleX(1)" : "scaleX(0)",
                transition: "transform 0.6s cubic-bezier(0.65,0,0.35,1)",
              }}
              aria-hidden
            />
          </div>
        </div>
      )}

      <div
        ref={contentRef}
        className="intro-content"
        style={{
          opacity: mountedOverlay ? visual.cOpacity : 1,
          transform: mountedOverlay ? `translateY(${visual.cY}px)` : "translateY(0)",
          willChange: "opacity, transform",
        }}
      >
        {children}
      </div>
    </>
  );
}