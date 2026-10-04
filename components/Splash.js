"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motionOK } from "./motion";

// First-visit splash: FM mark + red sweep, once per browser session.
// Purely decorative (pointer-events:none, aria-hidden) so it never blocks interaction.
export default function Splash() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!motionOK()) return;
    try {
      if (sessionStorage.getItem("fm-splash")) return;
      sessionStorage.setItem("fm-splash", "1");
    } catch {
      return;
    }
    const raf = requestAnimationFrame(() => setShow(true));
    const t = setTimeout(() => setShow(false), 1700);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, []);

  if (!show) return null;
  return (
    <div className="splash" aria-hidden="true">
      <div className="splash-inner">
        <Image src="/logo-mark.png" alt="" width={768} height={400} className="splash-mark" />
        <div className="splash-bar">
          <i />
        </div>
        <p className="splash-tag">Ride first. Ride strong.</p>
      </div>
    </div>
  );
}
