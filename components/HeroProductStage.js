"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export default function HeroProductStage({ product }) {
  const sectionRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const section = sectionRef.current;
      if (!section) return;
      const range = Math.max(section.offsetHeight - window.innerHeight, 1);
      setProgress(clamp(-section.getBoundingClientRect().top / range));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
    };
  }, []);

  const isCompactViewport = typeof window !== "undefined" && window.innerWidth <= 900;
  const shift = `${progress * (isCompactViewport ? 28 : 52)}vw`;
  const details = product?.details?.slice(0, 3) || [
    "Quality leather construction",
    "Rider-focused movement",
    "Available for wholesale enquiry",
  ];

  return (
    <section
      className="hero-product-scroll"
      ref={sectionRef}
      style={{ "--hero-progress": progress, "--hero-shift": shift }}
      aria-label="SYBOC INDUSTRIES featured product"
    >
      <div className="hero-product-sticky">
        <div className="hero-product-stripe" aria-hidden="true" />

        <div className="hero-product-copy" style={{ opacity: 1 - progress, transform: `translate(-${progress * 46}px, -50%)` }}>
          <h1 aria-label="SYBOC INDUSTRIES">
            <span className="line"><span>SYBOC</span></span>
            <span className="line"><span>INDUSTRIES</span></span>
          </h1>
          <p className="lede">Leather Wear, Motorcycle Wear and Western Wear for retailers, teams and independent brands.</p>
          <div className="row">
            <a className="btn" href="#quote">Request a quote</a>
            <a className="btn ghost" href="#suits">Browse the collection</a>
          </div>
          <ul className="hero-stats">
            <li>Three product divisions</li>
            <li>Wholesale enquiries</li>
            <li>Made for lasting wear</li>
          </ul>
        </div>

        <div className="hero-product-art" style={{ transform: `translate(calc(-50% - ${shift}), -50%)` }}>
          <Image src="/hero-prod.png" alt="SYBOC INDUSTRIES featured leather racing jacket" width={1230} height={1278} priority />
        </div>

        <aside className="hero-product-info" style={{ opacity: progress, transform: `translate(${(1 - progress) * 52}px, -50%)`, pointerEvents: progress > 0.65 ? "auto" : "none" }}>
          <p className="eyebrow">Featured / {product?.category || "Motorcycle Wear"}</p>
          <h2>{product?.name || "Leather Racing Jacket"}</h2>
          <p className="lede">{product?.description || "Built for focused riding, confident movement and lasting wear."}</p>
          <ul className="hero-spec-list">
            {details.map((detail) => <li key={detail}>{detail}</li>)}
          </ul>
          {product?.slug && (
            <Link className="hero-product-link" href={`/suits/${product.slug}`} transitionTypes={["nav-forward"]}>
              View product
            </Link>
          )}
        </aside>
      </div>
    </section>
  );
}
