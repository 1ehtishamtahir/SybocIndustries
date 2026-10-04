"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import RichText from "./RichText";

function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export default function PostForm({ post = null, categories = [], tags = [] }) {
  const router = useRouter();
  const editing = Boolean(post);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? "");
  const [categoryId, setCategoryId] = useState(post?.categoryId ?? "");
  const [selectedTags, setSelectedTags] = useState((post?.tags ?? []).map((t) => t.id));
  const [seoTitle, setSeoTitle] = useState(post?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(post?.seoDescription ?? "");
  const [keywords, setKeywords] = useState(post?.keywords ?? "");
  const [publish, setPublish] = useState(post?.status ?? "DRAFT");

  function toggleTag(id) {
    setSelectedTags((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const payload = {
      title,
      slug: slug || slugify(title),
      excerpt,
      content,
      coverImage,
      categoryId: categoryId || null,
      tagIds: selectedTags,
      seoTitle,
      seoDescription,
      keywords,
      status: publish,
    };
    try {
      const res = await fetch(editing ? `/api/admin/posts/${post.id}` : "/api/admin/posts", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Saving failed.");
      router.push("/admin/blog");
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
          <label htmlFor="post-title">Title</label>
          <input
            id="post-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => {
              if (!slugTouched && !editing) setSlug(slugify(title));
            }}
            required
          />
        </p>
        <p className="field">
          <label htmlFor="post-slug">Slug (URL)</label>
          <input
            id="post-slug"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(slugify(e.target.value));
            }}
            placeholder={slugify(title) || "post-url"}
          />
          <span className="hint">Public URL: /blog/{slug || slugify(title) || "post-url"}</span>
        </p>
      </div>

      <p className="field">
        <label htmlFor="post-excerpt">Excerpt</label>
        <textarea id="post-excerpt" rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
      </p>

      <p className="field">
        <label>Content</label>
        <RichText value={content} onChange={setContent} placeholder="Write the post..." />
      </p>

      <div className="form-row">
        <p className="field">
          <label htmlFor="post-cover">Cover image path</label>
          <input id="post-cover" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="/uploads/post.jpg" />
        </p>
        <p className="field">
          <label htmlFor="post-category">Category</label>
          <select id="post-category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Uncategorised</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </p>
        <p className="field">
          <label htmlFor="post-status">Status</label>
          <select id="post-status" value={publish} onChange={(e) => setPublish(e.target.value)}>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </p>
      </div>

      {tags.length > 0 && (
        <fieldset className="field" style={{ border: "1px solid var(--edge)", padding: "1rem" }}>
          <legend style={{ padding: "0 .5rem", fontSize: ".82rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: "var(--mute)" }}>
            Tags
          </legend>
          <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem" }}>
            {tags.map((t) => (
              <label key={t.id} className="badge" style={{ cursor: "pointer", padding: ".4rem .7rem" }}>
                <input
                  type="checkbox"
                  checked={selectedTags.includes(t.id)}
                  onChange={() => toggleTag(t.id)}
                  style={{ marginRight: ".4rem" }}
                />
                {t.name}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="form-row">
        <p className="field">
          <label htmlFor="post-seo-title">SEO meta title</label>
          <input id="post-seo-title" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
        </p>
        <p className="field">
          <label htmlFor="post-keywords">SEO keywords</label>
          <input id="post-keywords" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
        </p>
      </div>

      <p className="field">
        <label htmlFor="post-seo-desc">SEO meta description</label>
        <textarea id="post-seo-desc" rows={2} value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} />
      </p>

      {status === "error" && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <div className="admin-form-actions">
        <button className="btn" type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Saving..." : editing ? "Save changes" : "Create post"}
        </button>
        <button className="btn ghost dark" type="button" onClick={() => router.back()}>
          Cancel
        </button>
        {editing && post.status === "PUBLISHED" && (
          <a className="btn ghost dark" href={`/blog/${post.slug}`} target="_blank" rel="noreferrer">
            View live ↗
          </a>
        )}
      </div>
    </form>
  );
}
