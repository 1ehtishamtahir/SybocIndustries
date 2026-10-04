"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

const colorFields = [
  ["bg", "Card background"],
  ["fg", "Card text"],
  ["base", "Suit base"],
  ["accent", "Suit accent"],
  ["trim", "Suit trim"],
];

export default function ProductForm({ product = null, categories = [] }) {
  const router = useRouter();
  const editing = Boolean(product);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [note, setNote] = useState(product?.note ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [details, setDetails] = useState((product?.details ?? []).join("\n"));
  const [colors, setColors] = useState({
    bg: product?.colors?.bg ?? "#000000",
    fg: product?.colors?.fg ?? "#ffffff",
    base: product?.colors?.base ?? "#000000",
    accent: product?.colors?.accent ?? "#e10600",
    trim: product?.colors?.trim ?? "#000000",
  });
  const [price, setPrice] = useState(product?.price ?? "");
  const [priceNote, setPriceNote] = useState(product?.priceNote ?? "");
  const [image, setImage] = useState(product?.image ?? "");
  const [order, setOrder] = useState(product?.order ?? 0);
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [seoTitle, setSeoTitle] = useState(product?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(product?.seoDescription ?? "");
  const [keywords, setKeywords] = useState(product?.keywords ?? "");
  const [publish, setPublish] = useState(product?.status ?? "DRAFT");

  async function onSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const payload = {
      name,
      slug: slug || slugify(name),
      note,
      description,
      details,
      colors,
      price,
      priceNote,
      image,
      order: Number(order) || 0,
      categoryId: categoryId || null,
      seoTitle,
      seoDescription,
      keywords,
      status: publish,
    };
    try {
      const res = await fetch(editing ? `/api/admin/products/${product.id}` : "/api/admin/products", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Saving failed.");
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setStatus("error");
      setError(err.message);
    }
  }

  return (
    <form className="admin-form" onSubmit={onSubmit}>
      <div className="form-row">
        <p className="field">
          <label htmlFor="p-name">Name</label>
          <input
            id="p-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => {
              if (!slugTouched && !editing) setSlug(slugify(name));
            }}
            required
          />
        </p>
        <p className="field">
          <label htmlFor="p-slug">Slug (URL)</label>
          <input
            id="p-slug"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(slugify(e.target.value));
            }}
            placeholder={slugify(name) || "product-url"}
          />
          <span className="hint">Public URL: /suits/{slug || slugify(name) || "product-url"}</span>
        </p>
      </div>

      <p className="field">
        <label htmlFor="p-note">Short note</label>
        <input id="p-note" value={note} onChange={(e) => setNote(e.target.value)} />
        <span className="hint">One line shown under the name on cards.</span>
      </p>

      <p className="field">
        <label htmlFor="p-desc">Description</label>
        <textarea id="p-desc" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
      </p>

      <p className="field">
        <label htmlFor="p-details">Details (one bullet per line)</label>
        <textarea id="p-details" rows={6} value={details} onChange={(e) => setDetails(e.target.value)} />
      </p>

      <div className="form-row">
        <p className="field">
          <label htmlFor="p-price">Price (ZAR, optional)</label>
          <input id="p-price" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
        </p>
        <p className="field">
          <label htmlFor="p-price-note">Price note</label>
          <input id="p-price-note" value={priceNote} onChange={(e) => setPriceNote(e.target.value)} placeholder="Price on request" />
        </p>
      </div>

      <div className="form-row">
        <p className="field">
          <label htmlFor="p-image">Card image path</label>
          <input id="p-image" value={image} onChange={(e) => setImage(e.target.value)} placeholder="/uploads/suit.jpg" />
        </p>
        <p className="field">
          <label htmlFor="p-order">Sort order</label>
          <input id="p-order" type="number" value={order} onChange={(e) => setOrder(e.target.value)} />
        </p>
        <p className="field">
          <label htmlFor="p-category">Category</label>
          <select id="p-category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Uncategorised</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </p>
      </div>

      <fieldset className="field" style={{ border: "1px solid var(--edge)", padding: "1rem" }}>
        <legend style={{ padding: "0 .5rem", fontSize: ".82rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: "var(--mute)" }}>
          Suit colors
        </legend>
        <div className="form-row">
          {colorFields.map(([key, label]) => (
            <p className="field" key={key}>
              <label htmlFor={`color-${key}`}>{label}</label>
              <span style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
                <input
                  id={`color-${key}`}
                  type="color"
                  value={colors[key]}
                  onChange={(e) => setColors({ ...colors, [key]: e.target.value })}
                  style={{ width: "3rem", height: "2.2rem", padding: 0 }}
                />
                <input
                  aria-label={`${label} hex`}
                  value={colors[key]}
                  onChange={(e) => setColors({ ...colors, [key]: e.target.value })}
                  style={{ maxWidth: "7rem" }}
                />
              </span>
            </p>
          ))}
        </div>
      </fieldset>

      <div className="form-row">
        <p className="field">
          <label htmlFor="p-status">Status</label>
          <select id="p-status" value={publish} onChange={(e) => setPublish(e.target.value)}>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </p>
        <p className="field">
          <label htmlFor="p-seo-title">SEO meta title</label>
          <input id="p-seo-title" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
        </p>
      </div>

      <p className="field">
        <label htmlFor="p-seo-desc">SEO meta description</label>
        <textarea id="p-seo-desc" rows={2} value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} />
      </p>

      <p className="field">
        <label htmlFor="p-keywords">SEO keywords</label>
        <input id="p-keywords" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
      </p>

      {status === "error" && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <div className="admin-form-actions">
        <button className="btn" type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Saving..." : editing ? "Save changes" : "Create product"}
        </button>
        <button className="btn ghost dark" type="button" onClick={() => router.back()}>
          Cancel
        </button>
        {editing && product.status === "PUBLISHED" && (
          <a className="btn ghost dark" href={`/suits/${product.slug}`} target="_blank" rel="noreferrer">
            View live ↗
          </a>
        )}
      </div>
    </form>
  );
}
