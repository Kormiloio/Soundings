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

  it("runs the zero-warning type-aware lint gate in CI and before release staging", async () => {
    const [ci, release, packageJsonText] = await Promise.all([
      readFile(join(process.cwd(), ".github/workflows/ci.yml"), "utf8"),
      readFile(join(process.cwd(), ".github/workflows/release.yml"), "utf8"),
      readFile(join(process.cwd(), "package.json"), "utf8")
    ]);
    const packageJson = JSON.parse(packageJsonText) as {
      scripts?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };

    expect(packageJson.scripts?.lint).toBe("eslint . --max-warnings=0");
    expect(packageJson.scripts?.check).toContain("npm run lint");
    for (const name of ["eslint", "@eslint/js", "typescript-eslint", "eslint-plugin-obsidianmd"]) {
      expect(packageJson.devDependencies?.[name]).toMatch(/^\d+\.\d+\.\d+$/);
    }
    expect(ci).toContain("run: npm run lint");
    expect(ci.indexOf("run: npm run lint")).toBeLessThan(ci.indexOf("run: npm test"));
    expect(release).toMatch(/npm run (?:check|lint)/);
    expect(release.indexOf("npm run check")).toBeLessThan(release.indexOf("prepare-release.mjs"));
  });

  it("restricts release.yml to bare semantic tags Obsidian can install", async () => {
    const release = await readFile(join(process.cwd(), ".github/workflows/release.yml"), "utf8");
    expect(release).toContain("- \"[0-9]+.[0-9]+.[0-9]+\"");
    expect(release).not.toMatch(/- "v\[/);
    expect(release).toContain("git merge-base --is-ancestor \"$GITHUB_SHA\" origin/main");
    expect(release).toContain("--verify-tag");
  });

  it("keeps dependency installation read-only and scopes write permissions to the publish job", async () => {
    const release = await readFile(join(process.cwd(), ".github/workflows/release.yml"), "utf8");
    const [header, jobs] = release.split(/^jobs:$/m);
    const [build, publish] = jobs.split(/^  publish:$/m);
    expect(header).toContain("permissions: {}");
    expect(build).toContain("contents: read");
    expect(build).toContain("persist-credentials: false");
    expect(build).toContain("npm ci");
    expect(build).not.toMatch(/write/);
    expect(publish).toContain("contents: write");
    expect(publish).toContain("id-token: write");
    expect(publish).toContain("attestations: write");
    expect(publish).not.toMatch(/npm |actions\/checkout/);
    expect(publish).toContain("gh release view");
    expect(publish).toContain("--notes-file bundle/RELEASE_NOTES.md");
  });

  it("pins every action to a full commit SHA and uses a supported Node.js line", async () => {
    for (const name of ["ci.yml", "release.yml"]) {
      const workflow = await readFile(join(process.cwd(), ".github/workflows", name), "utf8");
      const uses = [...workflow.matchAll(/uses:\s*(\S+)/g)].map((match) => match[1]);
      expect(uses.length).toBeGreaterThan(0);
      for (const action of uses) expect(action).toMatch(/@[0-9a-f]{40}$/);
      expect(workflow).toContain("node-version: 22");
      expect(workflow).toContain("persist-credentials: false");
      expect(workflow).not.toContain("npm audit --production");
    }
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
