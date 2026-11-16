"use client";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { motionOK } from "./motion";

const AUTOPLAY_MS = 5000;

export default function HeroSlider({ slides = [] }) {
  const heroSlides = slides;
  const count = heroSlides.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [broken, setBroken] = useState({});
  const touchX = useRef(null);

  const go = useCallback((step) => setIndex((i) => (i + step + count) % count), [count]);

  // Autoplay restarts on every advance, so a manual swipe or dot click buys a
  // full interval. Held while hovered/focused, and off entirely when motion is
  // reduced or the visual-test seam (window.__NO_GSAP__) is set.
  useEffect(() => {
    if (paused || count < 2 || !motionOK()) return;
    const id = setTimeout(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearTimeout(id);
  }, [paused, count, index]);

  const onKey = (e) => {
    if (e.key === "ArrowLeft") go(-1);
    else if (e.key === "ArrowRight") go(1);
  };

  const onDown = (e) => {
    touchX.current = e.touches[0].clientX;
  };
  const onUp = (e) => {
    const start = touchX.current;
    touchX.current = null;
    if (start == null) return;
    const dx = e.changedTouches[0].clientX - start;
    if (Math.abs(dx) > 48) go(dx < 0 ? 1 : -1);
  };

  if (count === 0) return null;
  return (
    <section
      className="hero-slider"
      id="top"
      aria-roledescription="carousel"
          aria-label="SYBOC INDUSTRIES collection gallery"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={onKey}
      onTouchStart={onDown}
      onTouchEnd={onUp}
    >
      <div className="hero-slider-media" aria-hidden="true">
        {heroSlides.map((s, i) => (
          <figure className={`hero-slide${i === index ? " is-on" : ""}`} key={s.src}>
            {broken[s.src] ? (
              <span className="hero-slide-ph" />
            ) : (
              <Image
                src={s.src}
                alt={s.alt}
                fill
                sizes="100vw"
                priority={i === 0}
                className="hero-slide-img"
                onError={() => setBroken((b) => ({ ...b, [s.src]: true }))}
              />
            )}
          </figure>
        ))}
      </div>

    </section>
  );
}
