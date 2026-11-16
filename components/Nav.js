"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motionOK } from "./motion";

export default function Nav({ items = [], products = [], email = "" }) {
  const [open, setOpen] = useState(false);
  const [sub, setSub] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [compact, setCompact] = useState(false);
  const [away, setAway] = useState(false);
  const pathname = usePathname();
  const btnRef = useRef(null);
  const panelRef = useRef(null);
  const rootRef = useRef(null);

  // Logo drop plays only on the first mount of the session (synced with the
  // splash reveal). Applied as an inline style because React never writes to
  // the logo element's style, so the animation survives nav state re-renders;
  // motionOK() keeps it off under reduced motion and the visual-test seam.
  useEffect(() => {
    let first = false;
    try {
      first = !sessionStorage.getItem("fm-nav");
      sessionStorage.setItem("fm-nav", "1");
    } catch {
      return;
    }
    const logo = rootRef.current?.querySelector(".logo");
    if (first && logo && motionOK()) {
      logo.style.animation = "logoDrop .65s 1.25s cubic-bezier(.2,.8,.2,1) both";
    }
  }, []);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 12);
      setCompact(y > 140);
      const focused = rootRef.current?.contains(document.activeElement);
      setAway(y > 200 && y > last && !focused);
      last = y;
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  // Close menus when the route changes (render-phase state adjustment).
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOpen(false);
    setSub(false);
  }

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector("a")?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
        return;
      }
      if (e.key === "Tab") {
        const items = [...rootRef.current.querySelectorAll("a[href], button:not([disabled])")].filter(
          (el) => el.offsetParent !== null
        );
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    addEventListener("keydown", onKey);
    addEventListener("pointerdown", onDown);
    return () => {
      removeEventListener("keydown", onKey);
      removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const exact = (href) => (pathname === href ? "page" : undefined);
  const section = (href) => (pathname === href || pathname.startsWith(`${href}/`) ? "page" : undefined);
  const logoHref = pathname === "/" ? "#top" : "/";
  const classes = ["nav", scrolled && "is-scrolled", compact && "is-compact", away && !open && "is-hidden"]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={classes} ref={rootRef} style={{ viewTransitionName: "site-header" }}>
      <div className="nav-shell">
        <Link href={logoHref} className="logo" transitionTypes={["nav-back"]}>
          <Image src="/syboc-logo.png" alt="SYBOC INDUSTRIES" width={1004} height={392} className="logo-image" priority />
        </Link>
        <span className="nav-divider" aria-hidden="true" />
        <button
          type="button"
          ref={btnRef}
          className="menu-btn"
          aria-expanded={open}
          aria-controls="nav-links"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <span className="bars" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </button>
        <nav id="nav-links" ref={panelRef} data-open={open} aria-label="Primary navigation">
        {items
          .filter((item) => !item.isCta)
          .map((item) =>
            item.href === "/products" ? (
              <div className="nav-item" data-sub={sub} key={item.href}>
                <Link href={item.href} aria-current={section(item.href)} onClick={() => setOpen(false)} transitionTypes={["nav-forward"]}>
                  {item.label}
                </Link>
                <button
                  type="button"
                  className="sub-btn"
                  aria-expanded={sub}
                  aria-controls="products-menu"
                  onClick={() => setSub((s) => !s)}
                >
                  <span className="sr-only">{sub ? "Hide suits" : "Show suits"}</span>
                  <span aria-hidden="true">{sub ? "−" : "+"}</span>
                </button>
                <div className="dropdown" id="products-menu">
                  {products.map((s) => (
                    <Link
                      key={s.slug}
                      href={s.href || `/suits/${s.slug}`}
                      aria-current={exact(s.href || `/suits/${s.slug}`)}
                      onClick={() => setOpen(false)}
                      transitionTypes={["nav-forward"]}
                    >
                      {s.name}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link key={item.href} href={item.href} aria-current={exact(item.href)} onClick={() => setOpen(false)} transitionTypes={["nav-forward"]}>
                {item.label}
              </Link>
            )
          )}
        <p className="nav-note">
          Trade desk, Mon–Sat
          <a href={`mailto:${email}`}>{email}</a>
        </p>
        </nav>
      </div>
    </header>
  );
}
