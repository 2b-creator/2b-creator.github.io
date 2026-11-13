import {
  defineConfig,
  envField,
  fontProviders,
  svgoOptimizer,
} from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { rehypeHeadingIds, unified } from "@astrojs/markdown-remark";
import rehypeCallouts from "rehype-callouts";
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import { transformerFileName } from "./src/utils/transformers/fileName";
import { rehypeTableWrapper } from "./src/utils/rehypeTableWrapper";
import {
  inlineTocDeprecation,
  rehypeInlineToc,
} from "./src/utils/rehypeInlineToc";
import config from "./astro-paper.config";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
// One entry per file in src/i18n/lang/ (the file name is the locale code).
const LOCALES = ["en", "zh"] as const;

// Every page is served at the root (prefixDefaultLocale: false), so
// `Astro.currentLocale` — and therefore the UI language — is always
// defaultLocale. Deriving it from `site.lang` keeps the language switch to a
// single field in astro-paper.config.ts.
const siteLocale = LOCALES.find(locale => locale === config.site.lang);
if (!siteLocale) {
  throw new Error(
    `[i18n] site.lang "${config.site.lang}" has no matching src/i18n/lang/${config.site.lang}.ts file. ` +
      `Add that locale file or set site.lang to one of: ${LOCALES.join(", ")}.`
  );
}

export default defineConfig({
  site: config.site.url,
  integrations: [
    mdx(),
    sitemap({
      filter: page =>
        config.features?.showArchives !== false || !/\/archives\/?$/.test(page),
    }),
    inlineTocDeprecation(),
  ],
  i18n: {
    locales: [...LOCALES],
    defaultLocale: siteLocale,
    routing: {
      prefixDefaultLocale: false,
    },
  },
  markdown: {
    // Deprecated: the theme no longer uses remark-toc or remark-collapse. They
    // stay in package.json so a customised config importing them still builds,
    // and are removed in v8.
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [
        rehypeHeadingIds,
        rehypeInlineToc,
        rehypeCallouts,
        rehypeTableWrapper,
        rehypeKatex,
      ],
    }),
    shikiConfig: {
      themes: { light: "min-light", dark: "night-owl" },
      defaultColor: false,
      wrap: false,
      transformers: [
        transformerFileName({ style: "v2", hideDot: false }),
        transformerNotationHighlight(),
        transformerNotationWordHighlight(),
        transformerNotationDiff({ matchAlgorithm: "v3" }),
      ],
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  fonts: [
    {
      name: "Google Sans Code",
      cssVariable: "--font-google-sans-code",
      provider: fontProviders.google(),
      fallbacks: ["monospace"],
      weights: [300, 400, 500, 600, 700],
      styles: ["normal", "italic"],
      formats: ["woff", "ttf"],
    },
  ],
  env: {
    schema: {
      PUBLIC_GOOGLE_SITE_VERIFICATION: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
    },
  },
  experimental: {
    svgOptimizer: svgoOptimizer(),
  },
});
