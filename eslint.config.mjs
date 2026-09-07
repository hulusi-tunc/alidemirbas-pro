import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // archive/: preserved-but-retired repository content (the Operational
    // Workflows corpus, 2026-09-05). Verbatim snapshots of retired route shells
    // live there and must stay byte-for-byte, so they are neither linted nor
    // typechecked - same treatment tsconfig.json gives reference/.
    "archive/**",
    // content/archive/: retired UI components and copy kept for reuse; same
    // treatment as archive/.
    "content/**",
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
