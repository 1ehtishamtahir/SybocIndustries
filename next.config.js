// React/Next use eval in development for debugging (stack reconstruction);
// production never does, so 'unsafe-eval' stays out of the shipped policy.
const isDev = process.env.NODE_ENV === "development";

// Static export mode is available for frontend-only hosting.
const isExport = process.env.NEXT_OUTPUT === "export";

const csp = [
  "default-src 'self'",
  // 'unsafe-inline' for Next's bootstrap scripts and React style attributes;
  // move to nonce-based CSP once a middleware is in place.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://plausible.io`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self' https://plausible.io",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy", value: csp },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(isExport
    ? {
        output: "export",
        distDir: ".next-export",
        // Directory-style URLs (blog/index.html) so any static host resolves
        // the extensionless links the app renders (/blog, /suits/...).
        trailingSlash: true,
        // Static hosts serve /public images as-is, so skip the optimizer.
        images: { loader: "custom", loaderFile: "./scripts/export-image-loader.js" },
      }
    : {
        async headers() {
          return [{ source: "/(.*)", headers: securityHeaders }];
        },
      }),
};

module.exports = nextConfig;
