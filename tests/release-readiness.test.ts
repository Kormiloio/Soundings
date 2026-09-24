import { execFile } from "node:child_process";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const temporaryRoots: string[] = [];
const script = join(process.cwd(), "scripts/prepare-release.mjs");

async function createCandidate(overrides: {
  packageVersion?: string;
  manifestVersion?: string;
  minAppVersion?: string;
  includeLicense?: boolean;
  isDesktopOnly?: boolean;
  readme?: string;
  gitignore?: string;
} = {}): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "soundings-release-test-"));
  temporaryRoots.push(root);
  const manifestVersion = overrides.manifestVersion ?? "0.1.0";
  const minAppVersion = overrides.minAppVersion ?? "1.13.7";
  await writeFile(join(root, "package.json"), JSON.stringify({ name: "soundings", version: overrides.packageVersion ?? "0.1.0", license: "MIT" }));
  await writeFile(join(root, "manifest.json"), JSON.stringify({
    id: "soundings",
    name: "Soundings",
    version: manifestVersion,
    minAppVersion,
    description: "Turn transcript files into safe, structured Markdown beside their originals.",
    author: "Kormilo",
    isDesktopOnly: overrides.isDesktopOnly ?? true
  }));
  await writeFile(join(root, "versions.json"), JSON.stringify({ [manifestVersion]: minAppVersion }));
  await writeFile(join(root, ".gitignore"), overrides.gitignore ?? "main.js\nrelease/\n");
  await writeFile(join(root, "README.md"), overrides.readme ?? [
    "# Soundings",
    "## Requirements",
    "desktop-only",
    "## Installation",
    "## First use",
    "## Safety and privacy",
    "No network requests. No client-side or server-side telemetry. Soundings does not access files outside the active vault. Existing notes are never overwritten.",
    "## Known limitations",
    "## Support",
    "## Development",
    "## License",
    "MIT License"
  ].join("\n\n"));
  if (overrides.includeLicense !== false) {
    await writeFile(join(root, "LICENSE"), "MIT License\n\nCopyright (c) 2026 Kormilo\n");
  }
  await writeFile(join(root, "main.js"), "module.exports = {};\n");
  await writeFile(join(root, "styles.css"), ".soundings {}\n");
  return root;
}

async function run(root: string, tag = "0.1.0") {
  return execFileAsync(process.execPath, [script, "--root", root, "--output", join(root, "release", "0.1.0"), "--tag", tag]);
}

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("release readiness", () => {
  it("stages exactly the three Obsidian runtime assets", async () => {
    const root = await createCandidate();
    await mkdir(join(root, "release", "0.1.0"), { recursive: true });
    await writeFile(join(root, "release", "0.1.0", "stale.txt"), "stale");

    const { stdout } = await run(root);
    expect(stdout).toContain("Release 0.1.0 staged");
    expect(await readdir(join(root, "release", "0.1.0"))).toEqual(["main.js", "manifest.json", "styles.css"]);
    expect(await readFile(join(root, "release", "0.1.0", "manifest.json"), "utf8")).toBe(await readFile(join(root, "manifest.json"), "utf8"));
  });

  it("fails closed when package and manifest versions differ", async () => {
    const root = await createCandidate({ packageVersion: "0.1.1" });
    await expect(run(root)).rejects.toMatchObject({ stderr: expect.stringContaining("versions must match") });
  });

  it("fails closed when the release tag differs", async () => {
    const root = await createCandidate();
    await expect(run(root, "v0.1.0")).rejects.toMatchObject({ stderr: expect.stringContaining("Release tag must exactly match") });
  });

  it("fails closed when required public metadata is missing", async () => {
    const root = await createCandidate({ includeLicense: false });
    await expect(run(root)).rejects.toMatchObject({ stderr: expect.stringContaining("LICENSE") });
  });

  it("fails closed when the desktop compatibility boundary changes", async () => {
    const root = await createCandidate({ isDesktopOnly: false });
    await expect(run(root)).rejects.toMatchObject({ stderr: expect.stringContaining("desktop-only") });
  });

  it("fails closed when a required README disclosure is missing", async () => {
    const root = await createCandidate({ readme: "# Soundings\n" });
    await expect(run(root)).rejects.toMatchObject({ stderr: expect.stringContaining("README.md is missing required section") });
  });

  it("fails closed when generated release output is not ignored", async () => {
    const root = await createCandidate({ gitignore: "main.js\n" });
    await expect(run(root)).rejects.toMatchObject({ stderr: expect.stringContaining("release staging") });
  });
});
