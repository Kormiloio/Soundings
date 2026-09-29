import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("GitHub Actions workflow contracts", () => {
  it("enforces least-privilege permissions in ci.yml", async () => {
    const ci = await readFile(join(process.cwd(), ".github/workflows/ci.yml"), "utf8");
    expect(ci).toContain("contents: read");
    expect(ci).not.toContain("contents: write");
    expect(ci).not.toContain("id-token: write");
    expect(ci).not.toContain("attestations: write");
  });

  it("uses the lockfile-pinned OpenSpec CLI in both workflows", async () => {
    const [ci, release, packageJsonText] = await Promise.all([
      readFile(join(process.cwd(), ".github/workflows/ci.yml"), "utf8"),
      readFile(join(process.cwd(), ".github/workflows/release.yml"), "utf8"),
      readFile(join(process.cwd(), "package.json"), "utf8")
    ]);
    const packageJson = JSON.parse(packageJsonText) as {
      scripts?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };

    expect(packageJson.devDependencies?.["@fission-ai/openspec"]).toBe("1.13.1");
    expect(packageJson.scripts?.["spec:validate"]).toBe("openspec validate --all --strict");
    expect(ci).toContain("run: npm run spec:validate");
    expect(release).toContain("npm run spec:validate");
    expect(`${ci}\n${release}`).not.toContain("npx openspec");
  });

  it("restricts release.yml to explicit semantic tags and required attestation permissions", async () => {
    const release = await readFile(join(process.cwd(), ".github/workflows/release.yml"), "utf8");
    expect(release).toContain("contents: write");
    expect(release).toContain("id-token: write");
    expect(release).toContain("attestations: write");
    expect(release).toContain("- \"[0-9]+.[0-9]+.[0-9]+\"");
    expect(release).toContain("- \"v[0-9]+.[0-9]+.[0-9]+\"");
  });

  it("stages and attests the exact three Obsidian assets in release.yml", async () => {
    const release = await readFile(join(process.cwd(), ".github/workflows/release.yml"), "utf8");
    expect(release).toContain("main.js");
    expect(release).toContain("manifest.json");
    expect(release).toContain("styles.css");
    expect(release).toContain("actions/attest-build-provenance");
  });

  it("has content-free issue templates", async () => {
    const bugReport = await readFile(join(process.cwd(), ".github/ISSUE_TEMPLATE/bug_report.yml"), "utf8");
    expect(bugReport).toContain("Never include private transcript text");
    expect(bugReport).toContain("privacy_attestation");
  });
});
