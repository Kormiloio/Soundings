// Type-aware lint gate aligned with Obsidian's Community review. Tooling only; nothing here ships in main.js.
// Obsidian's recommended config already includes ESLint core and typescript-eslint type-checked rules.
import { defineConfig } from "eslint/config";
import obsidianmd from "eslint-plugin-obsidianmd";

export default defineConfig([
  { ignores: ["main.js", "node_modules/**", "release/**", "tests/**", "scripts/**", "coverage/**"] },
  ...obsidianmd.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        projectService: { allowDefaultProject: ["eslint.config.*", "*.config.*"] },
        tsconfigRootDir: import.meta.dirname
      }
    }
  },
  {
    // Keep the sentence-case rule, but preserve the product name and quoted command names,
    // which are proper nouns rather than prose.
    files: ["src/**/*.ts"],
    rules: {
      "obsidianmd/ui/sentence-case": ["warn", { brands: ["Soundings", "Obsidian", "WebVTT", "Markdown"], ignoreRegex: ["‘[^’]+’"] }]
    }
  }
]);
