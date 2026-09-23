import { describe, expect, it } from "vitest";
import { executePlan, type PublicationAdapter } from "../src/core/execution";
import { sha256 } from "../src/core/hash";
import { buildPlan } from "../src/core/planning";
import { DEFAULT_SETTINGS } from "../src/core/settings";
import type { DiscoveryItem } from "../src/core/discovery";

const encoder = new TextEncoder();

class Vault implements PublicationAdapter {
  readonly files = new Map<string, Uint8Array>();
  async readBinary(path: string): Promise<Uint8Array> {
    const value = this.files.get(path);
    if (!value) throw new Error("missing");
    return new Uint8Array(value);
  }
  exists(path: string): boolean { return this.files.has(path); }
  async createBinary(path: string, bytes: Uint8Array): Promise<void> {
    if (this.files.has(path)) throw new Error("exists");
    this.files.set(path, new Uint8Array(bytes));
  }
}

async function discovered(path: string, body: string): Promise<DiscoveryItem> {
  const bytes = encoder.encode(body);
  const format = path.endsWith(".vtt") ? "vtt" : "txt";
  return {
    sourcePath: path,
    format,
    classification: "eligible",
    reason: "Ready",
    evidence: { path, format, byteLength: bytes.byteLength, sha256: await sha256(bytes) }
  };
}

describe("mixed reviewed batch", () => {
  it("reports created, colliding, stale, malformed, and unselected items without content", async () => {
    const originals = {
      "created.txt": "create me",
      "collision.txt": "do not overwrite",
      "stale.txt": "preview body",
      "malformed.vtt": "not vtt",
      "unselected.txt": "leave me"
    };
    const discovery = await Promise.all(Object.entries(originals).map(([path, body]) => discovered(path, body)));
    const plan = buildPlan(discovery, new Set(["collision.md"]), DEFAULT_SETTINGS, new Date(0), () => "mixed");
    const vault = new Vault();
    for (const [path, body] of Object.entries(originals)) vault.files.set(path, encoder.encode(body));
    vault.files.set("collision.md", encoder.encode("winner"));
    vault.files.set("stale.txt", encoder.encode("changed after preview"));

    const outcomes = await executePlan(plan, vault, {
      selectedSourcePaths: new Set(["created.txt", "collision.txt", "stale.txt", "malformed.vtt"]),
      settings: DEFAULT_SETTINGS,
      now: () => new Date(0)
    });
    expect(outcomes.map((entry) => entry.status)).toEqual(["created", "blocked", "stale", "failed", "skipped"]);
    expect(new TextDecoder().decode(vault.files.get("collision.md"))).toBe("winner");
    expect(vault.files.has("unselected.md")).toBe(false);
    const report = JSON.stringify(outcomes);
    for (const body of Object.values(originals)) expect(report).not.toContain(body);
  });

  it("creates a reviewed safe destination for a colon-bearing source without changing source identity", async () => {
    const sourcePath = "Meetings/1:1: Charles : Mario.txt";
    const destinationPath = "Meetings/1 - 1 - Charles - Mario.md";
    const body = "private transcript body";
    const sourceBytes = encoder.encode(body);
    const plan = buildPlan([await discovered(sourcePath, body)], new Set(), DEFAULT_SETTINGS, new Date(0), () => "safe-name");
    expect(plan.items[0]).toMatchObject({ sourcePath, destinationPath, classification: "eligible" });

    const vault = new Vault();
    vault.files.set(sourcePath, sourceBytes);
    const beforeHash = await sha256(sourceBytes);
    const outcomes = await executePlan(plan, vault, {
      selectedSourcePaths: new Set([sourcePath]),
      settings: DEFAULT_SETTINGS,
      now: () => new Date(0)
    });

    expect(outcomes).toEqual([{ sourcePath, destinationPath, status: "created", reason: "Markdown note created and verified." }]);
    expect(await sha256(vault.files.get(sourcePath)!)).toBe(beforeHash);
    const created = new TextDecoder().decode(vault.files.get(destinationPath));
    expect(created).toContain('source_file: "1:1: Charles : Mario.txt"');
    expect(created).toContain("# 1:1: Charles : Mario");
    expect(created).toContain(body);
  });

  it("preserves an existing sanitized destination byte-for-byte", async () => {
    const sourcePath = "1:1 Meeting.txt";
    const destinationPath = "1 - 1 Meeting.md";
    const plan = buildPlan([await discovered(sourcePath, "source")], new Set([destinationPath]), DEFAULT_SETTINGS, new Date(0), () => "collision");
    const vault = new Vault();
    vault.files.set(sourcePath, encoder.encode("source"));
    vault.files.set(destinationPath, encoder.encode("existing note"));

    const outcomes = await executePlan(plan, vault, {
      selectedSourcePaths: new Set([sourcePath]),
      settings: DEFAULT_SETTINGS
    });

    expect(outcomes[0]).toMatchObject({ destinationPath, status: "blocked" });
    expect(new TextDecoder().decode(vault.files.get(destinationPath))).toBe("existing note");
    expect(new TextDecoder().decode(vault.files.get(sourcePath))).toBe("source");
  });
});
