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
});
