import Link from "next/link";
import PageShell from "../../components/PageShell";
import { Reveal, SplitLines } from "../../components/motion";
import { faqs } from "../../data/content";

export const metadata = {
  title: "FAQ",
  description: "MOQ, wholesale pricing, lead times, branding, certifications and shipping for First Moto trade orders.",
  alternates: { canonical: "/faq" },
  openGraph: { title: "FAQ | First Moto", description: "MOQ, lead times, branding and terms.", url: "/faq" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(([q, a]) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

export default function FaqPage() {
  return (
    <PageShell mainClass="page">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <header className="page-head">
          <SplitLines as="h1">Questions</SplitLines>
          <p>The things buyers ask before they order. Anything missing, the trade desk will answer by email.</p>
        </header>

        <Reveal className="faq" stagger={0.08} duration={0.7}>
          {faqs.map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <div className="faq-body">
                <p>{a}</p>
              </div>
            </details>
          ))}
        </Reveal>

        <Reveal className="band-cta" variant="up">
          <h2>Still unsure?</h2>
          <Link className="btn" href="/contact" transitionTypes={["nav-forward"]}>
            Ask us directly
          </Link>
        </Reveal>
    </PageShell>
  );
}
