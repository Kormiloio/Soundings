import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      obsidian: fileURLToPath(new URL("./tests/obsidian-runtime-stub.ts", import.meta.url))
    }
  },
  test: {
    coverage: { reporter: ["text", "json", "html"] }
  }
});
