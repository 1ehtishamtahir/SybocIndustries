import Script from "next/script";
import { Archivo_Black } from "next/font/google";
import Splash from "../components/Splash";
import { getSettings } from "../lib/content";
import "./globals.css";
import "./light-theme.css";
import "./social.css";
import "./fitting.css";
import "./landing.css";
import "./landing-overrides.css";
import "./company-fix.css";
import "./responsive.css";

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-archivo-black",
  display: "swap",
});

// The public site uses local frontend data and can be statically exported.
export const dynamic = "force-static";

const site = process.env.NEXT_PUBLIC_SITE_URL || "https://sybocindustries.example";
const plausible = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

const defaultTitle = "SYBOC INDUSTRIES | Leather, Motorcycle and Western Wear";
const defaultDescription =
  "SYBOC INDUSTRIES creates distinctive Leather Wear, Motorcycle Wear and Western Wear for retailers and independent brands.";

export async function generateMetadata() {
  const settings = await getSettings();
  const title = settings["seo.title"] || defaultTitle;
  const description = settings["seo.description"] || defaultDescription;
  const template = settings["seo.titleTemplate"] || "";
  const siteName = settings["site.name"] || "SYBOC INDUSTRIES";

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

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default async function RootLayout({ children }) {
  const settings = await getSettings();
  const siteName = settings["site.name"] || "SYBOC INDUSTRIES";
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: siteName,
        url: site,
        logo: `${site}/syboc-logo.png`,
        email: settings["contact.email"] || "sales@sybocindustries.example",
      },
      {
        "@type": "WebSite",
        name: siteName,
        url: site,
      },
    ],
  };

  return (
    <html lang="en" className={archivoBlack.variable} data-scroll-behavior="smooth">
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
