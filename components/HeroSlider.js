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
  const slide = heroSlides[index];

  return (
    <section
      className="hero-slider"
      id="top"
      aria-roledescription="carousel"
      aria-label="First Moto gallery"
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

      <div className="hero-slider-copy">
        <div className="hero-slider-text" key={index}>
          <p className="eyebrow">Wholesale / 01</p>
          <h2>{slide.title}</h2>
          <p className="lede">{slide.note}</p>
        </div>
      </div>

      <div className="hero-slider-ui">
        <p className="hero-count" aria-hidden="true">
          <b>{String(index + 1).padStart(2, "0")}</b> / {String(count).padStart(2, "0")}
        </p>
        <div className="hero-dots" role="group" aria-label="Choose a slide">
          {heroSlides.map((s, i) => (
            <button
              type="button"
              key={s.src}
              className="hero-dot"
              aria-label={`Slide ${i + 1}: ${s.title}`}
              aria-current={i === index ? "true" : undefined}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
        <div className="hero-arrows">
          <button type="button" className="hero-arrow" aria-label="Previous slide" onClick={() => go(-1)}>
            <span aria-hidden="true">&#8592;</span>
          </button>
          <button type="button" className="hero-arrow" aria-label="Next slide" onClick={() => go(1)}>
            <span aria-hidden="true">&#8594;</span>
          </button>
        </div>
      </div>
    </section>
  );
}
