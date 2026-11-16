import coreWebVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...coreWebVitals,
  {
    ignores: [".next/**", ".next-export/**", ".export-tmp/**", "node_modules/**", "playwright-report/**", "test-results/**", "out/**", "app/generated/**", "prisma/migrations/**"],
  },
];

export default config;
