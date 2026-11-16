import Link from "next/link";
import Image from "next/image";
import PageShell from "../../components/PageShell";
import { Reveal, SplitLines } from "../../components/motion";
import { getPublishedPosts } from "../../lib/content";

export const metadata = {
  title: "Blog",
  description: "Production notes, product guidance and stories from the SYBOC INDUSTRIES trade desk.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog | SYBOC INDUSTRIES",
    description: "Production notes, sizing guidance and track reports.",
    url: "/blog",
  },
};

const fmt = (d) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <PageShell mainClass="page">
      <header className="page-head">
        <p className="eyebrow">SYBOC / Journal</p>
        <SplitLines as="h1">The journal.</SplitLines>
        <p>Notes from the product desk: what we are making, how to choose it and the details that make a collection easier to sell.</p>
      </header>

      {posts[0] && <Reveal className="journal-feature" variant="up"><div className="journal-feature-art"><Image src="/hero-leather-v2.png" alt="Leather collection detail" fill sizes="(max-width: 700px) 100vw, 40vw" /><span>SYBOC<br /><b>FIELD<br />NOTES</b></span></div><div className="journal-feature-copy"><p className="eyebrow">Featured story / {posts[0].category?.name || "Journal"}</p><h2><Link href={`/blog/${posts[0].slug}`} transitionTypes={["nav-forward"]}>{posts[0].title}</Link></h2><p>{posts[0].excerpt || "A closer look at the ideas and products shaping the SYBOC collection."}</p><div className="journal-feature-meta"><span>{fmt(posts[0].publishedAt)}</span><Link className="btn ghost" href={`/blog/${posts[0].slug}`} transitionTypes={["nav-forward"]}>Read the story</Link></div></div></Reveal>}
      <div className="section-heading"><p className="eyebrow">From the trade desk</p><h2>Useful context for a better product conversation.</h2></div>

      {posts.length === 0 ? (
        <Reveal className="blog-grid" stagger={0.1} duration={0.8}>
          {[['Inside the SYBOC collection', 'A closer look at the three product stories that shape the range.', '/products'], ['How to choose the right leather piece', 'Use category, customer and intended wear to build a clearer product mix.', '/fitting'], ['Start a wholesale conversation', 'The information that helps us prepare a useful product and pricing response.', '/quote']].map(([title, excerpt, href]) => <article className="card-info" key={title}><p className="eyebrow">SYBOC / Field note</p><h2 className="sub">{title}</h2><p className="muted">{excerpt}</p><Link className="btn ghost" href={href}>Explore</Link></article>)}
        </Reveal>
      ) : (
        <Reveal className="blog-grid" stagger={0.1} duration={0.8}>
          {posts.map((post) => (
            <article className="card-info" key={post.slug}>
              <p className="eyebrow">
                {fmt(post.publishedAt)}
                {post.category ? ` / ${post.category.name}` : ""}
              </p>
              <h2 className="sub">
                <Link href={`/blog/${post.slug}`} transitionTypes={["nav-forward"]}>
                  {post.title}
                </Link>
              </h2>
              {post.excerpt && <p className="muted">{post.excerpt}</p>}
              <Link className="btn ghost" href={`/blog/${post.slug}`} transitionTypes={["nav-forward"]}>
                Read more
              </Link>
            </article>
          ))}
        </Reveal>
      )}
      <Reveal className="journal-signoff" variant="up"><p className="eyebrow">Have a question?</p><h2>Ask the people behind the range.</h2><Link className="btn" href="/contact" transitionTypes={["nav-forward"]}>Contact the trade desk</Link></Reveal>
    </PageShell>
  );
}
