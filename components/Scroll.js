"use client";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, motionOK } from "./motion";

const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// Red bar at the top that fills as the page scrolls.
export function ScrollBar() {
  const ref = useRef(null);
  useEffect(() => {
    const f = () => {
      const h = document.documentElement;
      ref.current.style.transform = `scaleX(${h.scrollTop / (h.scrollHeight - h.clientHeight || 1)})`;
    };
    f();
    addEventListener("scroll", f, { passive: true });
    return () => removeEventListener("scroll", f);
  }, []);
  return <div className="bar" ref={ref} />;
}

// Vertical scroll drives a pinned horizontal track (GSAP ScrollTrigger, scrub 1:1).
export function HScroll({ children }) {
  const wrap = useRef(null);
  const track = useRef(null);
  useEffect(() => {
    const w = wrap.current;
    const t = track.current;
    if (!w || !t) return;
    if (reduced() || !motionOK()) return;

    // Marker for the CSS fallback: without it the track is a native horizontal
    // scroller, so the cards stay reachable when GSAP never runs (no JS, failed
    // load, test seam). Enhanced, it clips and the transform takes over.
    w.dataset.enh = "1";
    let dist = 0;
    const layout = () => {
      dist = Math.max(0, t.scrollWidth - innerWidth);
      w.style.height = `${dist + innerHeight}px`;
      return dist;
    };

    const ctx = gsap.context(() => {
      layout();
      ScrollTrigger.create({
        trigger: w,
        start: "top top",
        end: () => `+=${layout()}`,
        onRefreshInit: layout,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          t.style.transform = `translate3d(${-self.progress * dist}px,0,0)`;
          w.style.setProperty("--p", self.progress);
        },
      });
    }, w);

    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    const ro = new ResizeObserver(() => ScrollTrigger.refresh());
    ro.observe(t);
    return () => {
      ro.disconnect();
      ctx.revert();
      delete w.dataset.enh;
      w.style.height = "";
      t.style.transform = "";
    };
  }, []);
  return (
    <div className="hwrap" ref={wrap} id="suits">
      <div className="hsticky">
        <div className="htrack" ref={track}>{children}</div>
        <div className="hprog"><i /></div>
      </div>
    </div>
  );
}

// Infinite marquee that speeds up with scroll velocity.
export function Drift({ children, dir = 1, className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced() || !motionOK()) return;

    const ctx = gsap.context(() => {
      const loop = el.querySelector(".drift-loop");
      if (!loop) return;
      const tween = gsap.to(loop, {
        xPercent: dir > 0 ? -50 : 0,
        duration: 22,
        ease: "none",
        repeat: -1,
        startAt: { xPercent: dir > 0 ? 0 : -50 },
      });
      const boost = gsap.quickTo(tween, "timeScale", { duration: 0.3, ease: "power2.out" });
      const st = ScrollTrigger.create({
        trigger: el.closest(".bands") || el,
        onUpdate: (self) => boost(1 + Math.min(Math.abs(self.getVelocity()) / 500, 4)),
      });
      const slow = () => boost(1);
      ScrollTrigger.addEventListener("scrollEnd", slow);
      return () => {
        ScrollTrigger.removeEventListener("scrollEnd", slow);
        st.kill();
      };
    }, el);
    return () => ctx.revert();
  }, [dir]);
  return (
    <div className={`drift ${className}`} ref={ref}>
      <span className="drift-loop" aria-hidden="true">
        <span>{children}</span>
        <span>{children}</span>
      </span>
    </div>
  );
}
