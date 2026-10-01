import { describe, expect, it } from "vitest";
import { DEFAULT_OUTPUT_PROFILE, RESERVED_SECTIONS, sanitizeSavedSettings, validateOutputProfile } from "../src/core/settings";
import type { OutputProfile } from "../src/core/settings";

function profileWith(overrides: Record<string, unknown>): Partial<OutputProfile> {
  return { ...DEFAULT_OUTPUT_PROFILE, ...overrides } as unknown as Partial<OutputProfile>;
}

describe("type-safe output-profile validation keeps its behavior", () => {
  it("rejects every non-section value with the same messages, in order", () => {
    const result = validateOutputProfile(profileWith({ enabledSections: ["summary", 7, "bogus", null, { x: 1 }, "decisions"] }));
    expect(result.profile).toBeUndefined();
    expect(result.errors).toEqual([
      "Unknown reserved section: 7.",
      "Unknown reserved section: bogus.",
      "Unknown reserved section: null.",
      "Unknown reserved section: [object Object]."
    ]);
  });

  const nonArrays: ReadonlyArray<{ readonly label: string; readonly value: unknown }> = [
    { label: "a string", value: "summary" },
    { label: "a number", value: 3 },
    { label: "an object", value: { summary: true } }
  ];
  for (const { label, value } of nonArrays) {
    it(`rejects ${label} as sections with the same message`, () => {
      const result = validateOutputProfile(profileWith({ enabledSections: value }));
      expect(result.errors).toEqual([`Expected an array for enabled sections, but received: ${typeof value}.`]);
    });
  }

  it("keeps treating null sections as the default sections", () => {
    const result = validateOutputProfile(profileWith({ enabledSections: null }));
    expect(result.errors).toEqual([]);
    expect(result.profile?.enabledSections).toEqual(RESERVED_SECTIONS);
  });

  it("accepts valid sections, de-duplicates them, and keeps canonical order", () => {
    const result = validateOutputProfile(profileWith({ enabledSections: ["follow-ups", "summary", "summary"] }));
    expect(result.errors).toEqual([]);
    expect(result.profile?.enabledSections).toEqual(["summary", "follow-ups"]);
  });

  it("accepts every reserved section", () => {
    expect(validateOutputProfile(profileWith({ enabledSections: [...RESERVED_SECTIONS] })).profile?.enabledSections).toEqual(RESERVED_SECTIONS);
  });

  it("rejects non-string tags with the same message", () => {
    const result = validateOutputProfile(profileWith({ staticTags: ["meeting", 5, true] }));
    expect(result.errors).toEqual(["Invalid static tag type: number. Expected string.", "Invalid static tag type: boolean. Expected string."]);
  });

  it("still sanitizes saved settings by field type", () => {
    expect(sanitizeSavedSettings({ observationEnabled: true, projectRoot: 4 })).toEqual({
      input: { observationEnabled: true },
      resetFields: ["projectRoot"]
    });
  });
});
