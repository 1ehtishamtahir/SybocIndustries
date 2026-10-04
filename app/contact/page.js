import Link from "next/link";
import Image from "next/image";
import PageShell from "../../components/PageShell";
import { Reveal, SplitLines } from "../../components/motion";
import { getSettings, parseJson } from "../../lib/content";

export const metadata = {
  title: "Contact",
  description: "Email the First Moto trade desk, see the hours, or request a quote.",
  alternates: { canonical: "/contact" },
  openGraph: { title: "Contact | First Moto", description: "Talk to the trade desk.", url: "/contact" },
};

export default async function ContactPage() {
  const settings = await getSettings();
  const email = settings["contact.email"];
  const hours = parseJson(settings["contact.hours"], []);
  const whatsapp = (settings["contact.whatsapp"] || process.env.NEXT_PUBLIC_WHATSAPP || "").replace(/\D/g, "");
  const waHref = whatsapp
    ? `https://wa.me/${whatsapp}?text=${encodeURIComponent("Hi First Moto, I have a question about your suits.")}`
    : null;

  return (
    <PageShell mainClass="page">
        <header className="page-head">
          <SplitLines as="h1">Talk to the trade desk</SplitLines>
          <p>Pricing, orders, branding or stock questions: one inbox, answered within a working day.</p>
        </header>

        <div className="cols">
          <Reveal className="contact-list" stagger={0.12}>
            <div className="card-info contact-visual">
              <Image src="/First Moto.jpg" alt="First Moto — ride first, ride strong" width={1080} height={1080} />
            </div>
            <div className="card-info">
              <h2 className="sub">Email</h2>
              <a className="big-link" href={`mailto:${email}`}>
                {email}
              </a>
              {waHref && (
                <p className="muted">
                  <a href={waHref} target="_blank" rel="noopener noreferrer">
                    Message us on WhatsApp
                  </a>
                </p>
              )}
            </div>
            <div className="card-info">
              <h2 className="sub">Trade desk hours</h2>
              <ul className="bullets">
                {hours.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal className="contact-list" stagger={0.12} duration={1}>
            <div className="card-info">
              <h2 className="sub">Want pricing first?</h2>
              <p className="muted">The quote form sends your model mix and volumes straight to the trade desk, with a quote back within one working day.</p>
              <Link className="btn" href="/quote" transitionTypes={["nav-forward"]}>
                Request a quote
              </Link>
            </div>
            <div className="card-info">
              <h2 className="sub">Terms or lead time question?</h2>
              <p className="muted">Most answers are already written up, including MOQ, production times and payment terms.</p>
              <Link className="btn ghost" href="/faq" transitionTypes={["nav-forward"]}>
                Read the FAQ
              </Link>
            </div>
          </Reveal>
        </div>
    </PageShell>
  );
}
