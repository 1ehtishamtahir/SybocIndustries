import PageShell from "../../components/PageShell";
import { Reveal, SplitLines } from "../../components/motion";
import { getSetting } from "../../lib/content";

export const metadata = {
  title: "Privacy",
  description: "What the First Moto quote form collects, how it is used, and how to have it deleted.",
  alternates: { canonical: "/privacy" },
  openGraph: { title: "Privacy | First Moto", description: "How we handle your details.", url: "/privacy" },
};

export default async function PrivacyPage() {
  const email = await getSetting("contact.email");
  return (
    <PageShell mainClass="page">
        <header className="page-head">
          <SplitLines as="h1">Privacy</SplitLines>
          <p>Short version: we collect what a quote needs, we use it for that, and we do not sell it.</p>
        </header>

        <Reveal className="prose" duration={0.8}>
        <h2>What we collect</h2>
        <p>
          When you request a quote or contact the trade desk, you give us your contact name, company, email address,
          buyer type, quantities, a target delivery date and any notes you choose to add. Nothing on this site sets
          advertising or tracking cookies.
        </p>

        <h2>How we use it</h2>
        <p>
          To reply with pricing and lead time, prepare your order and deliver it. We do not sell, rent or share your
          details with anyone outside the trade desk.
        </p>

        <h2>How long we keep it</h2>
        <p>
          Quote requests are kept for 12 months so we can see what was quoted and when, then deleted. Order records
          are kept for the period required for warranty and tax purposes.
        </p>

        <h2>Your rights</h2>
        <p>
          Ask what we hold, ask for corrections, or ask us to delete it entirely. Email{" "}
          <a href={`mailto:${email}`}>{email}</a> and we will action it within 30 days.
        </p>

        <h2>Changes</h2>
        <p>If this policy changes in a way that affects you, we will note it here with the update date.</p>
      </Reveal>
    </PageShell>
  );
}
