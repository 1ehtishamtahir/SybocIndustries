import { Big_Shoulders, Barlow } from "next/font/google";
import Script from "next/script";
import Splash from "../components/Splash";
import { getSettings } from "../lib/content";
import "./globals.css";

const display = Big_Shoulders({ subsets: ["latin"], variable: "--display", adjustFontFallback: false });
const body = Barlow({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--body" });

// Everything below the root layout renders per request: public pages read CMS
// content from MySQL, admin routes read the session cookie.
export const dynamic = "force-dynamic";

const site = process.env.NEXT_PUBLIC_SITE_URL || "https://firstmoto.example";
const plausible = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

const defaultTitle = "First Moto | Wholesale racing and moto suits";
const defaultDescription =
  "Race-grade leather and textile suits for dealers, race teams, schools and fleet buyers.";

export async function generateMetadata() {
  const settings = await getSettings();
  const title = settings["seo.title"] || defaultTitle;
  const description = settings["seo.description"] || defaultDescription;
  const template = settings["seo.titleTemplate"] || "";
  const siteName = settings["site.name"] || "First Moto";

  return {
    metadataBase: new URL(site),
    title: template ? { default: title, template } : title,
    description,
    applicationName: siteName,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      url: "/",
      siteName,
      title,
      description,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export const viewport = { themeColor: "#000000" };

export default async function RootLayout({ children }) {
  const settings = await getSettings();
  const siteName = settings["site.name"] || "First Moto";
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: siteName,
        url: site,
        logo: `${site}/logo-mark.png`,
        email: settings["contact.email"] || "trade@firstmoto.example",
      },
      {
        "@type": "WebSite",
        name: siteName,
        url: site,
      },
    ],
  };

  return (
    <html lang="en" className={`${display.variable} ${body.variable}`} data-scroll-behavior="smooth">
      <body>
        <noscript>
          {/* Home prerenders behind a Suspense boundary; without JS the reveal
              script never runs, so unhide the streamed content and drop the
              loading shell. Other routes render inline and are unaffected. */}
          <style>{`.state-page{display:none}div[hidden]{display:block}`}</style>
        </noscript>
        <Splash />
        {children}
        {plausible && (
          <Script strategy="afterInteractive" data-domain={plausible} src="https://plausible.io/js/script.js" />
        )}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
