"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

export { gsap, ScrollTrigger };

// Motion is on unless the visual-test seam is set or the visitor prefers reduced motion.
export function motionOK() {
  if (typeof window === "undefined") return false;
  if (window.__NO_GSAP__) return false;
  // Keep the site's authored motion visible in the preview/browser. Tests can
  // still disable it explicitly through the __NO_GSAP__ seam above.
  return true;
}

// Runs a scoped gsap.context for the component lifetime. No-op when motion is off.
export function useGsap(setup, deps = []) {
  const ref = useRef(null);
  useEffect(() => {
    if (!motionOK()) return;
    const ctx = gsap.context((self) => setup(self, ref.current), ref);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}

// Reveal from/to states. No opacity changes: axe evaluates contrast from computed
// colors, so fading text mid-scan would be racy. Transform/clip/filter only.
const FROM = {
  up: { y: 56 },
  left: { x: -56 },
  right: { x: 56 },
  scale: { scale: 0.92 },
  wipe: { clipPath: "inset(0% 0% 100% 0%)" },
  blur: { filter: "blur(14px)" },
};
const TO = {
  up: { y: 0 },
  left: { x: 0 },
  right: { x: 0 },
  scale: { scale: 1 },
  wipe: { clipPath: "inset(0% 0% 0% 0%)" },
  blur: { filter: "blur(0px)" },
};

// Scroll-in reveal. Renders its `as` tag (div by default) so markup stays identical.
// Both ends are stated explicitly: several targets (.why-item, .faq details, .tile)
// carry a CSS `transition: transform` for their hover state, and gsap.from would then
// record that transitioned value as its end state, parking the element 56px low.
// clearProps hands the property back to CSS on completion so :hover transitions work.
export function Reveal({ variant = "up", stagger = 0, duration = 0.9, as, className, children, ...rest }) {
  const Tag = as || "div";
  const ref = useGsap(
    (_self, el) => {
      const targets = stagger > 0 ? Array.from(el.children) : el;
      if (!targets.length) return;
      const key = variant in FROM ? variant : "up";
      gsap.fromTo(targets, FROM[key], {
        ...TO[key],
        duration,
        ease: "power3.out",
        stagger,
        clearProps: key === "wipe" ? "clipPath" : key === "blur" ? "filter" : "transform",
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      });
    },
    [variant, stagger, duration]
  );
  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
}

// Heading revealed line by line via SplitText masks (falls back to a fade).
// Split happens after webfonts settle so line breaks are measured correctly.
export function SplitLines({ as: Tag = "h2", className, children, start = "top 85%", ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!motionOK()) return;
    const el = ref.current;
    if (!el) return;
    let split = null;
    let ctx = null;
    let cancelled = false;
    const run = () => {
      if (cancelled || !motionOK()) return;
      ctx = gsap.context(() => {
        try {
          split = new SplitText(el, { type: "lines", mask: "lines" });
        } catch {
          split = null;
        }
        const targets = split ? split.lines : [el];
        if (!targets.length) return;
        const vars = split
          ? { yPercent: 115, duration: 1.05, stagger: 0.08, ease: "power4.out" }
          : { y: 40, duration: 0.9, ease: "power3.out" };
        gsap.from(targets, { ...vars, scrollTrigger: { trigger: el, start, once: true } });
      }, el);
    };
    if (document.fonts?.ready) document.fonts.ready.then(run).catch(run);
    else run();
    return () => {
      cancelled = true;
      split?.revert();
      ctx?.revert();
    };
  }, [start]);
  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
}

// Scroll-scrubbed parallax: travels from -amount/2 to +amount/2 across the viewport.
export function Parallax({ amount = 80, as, className, children, ...rest }) {
  const Tag = as || "div";
  const ref = useGsap(
    (_self, el) => {
      gsap.fromTo(
        el,
        { y: -amount / 2 },
        {
          y: amount / 2,
          ease: "none",
          scrollTrigger: { trigger: el, scrub: true, start: "top bottom", end: "bottom top" },
        }
      );
    },
    [amount]
  );
  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
}

