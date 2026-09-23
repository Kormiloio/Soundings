import { describe, expect, it } from "vitest";
import type { ExecutionStatus, PlanClassification } from "../src/core/types";

const classifications: Record<PlanClassification, true> = {
  eligible: true,
  excluded: true,
  unsupported: true,
  unreadable: true,
  empty: true,
  oversize: true,
  "destination-exists": true,
  "destination-ambiguous": true
};
const statuses: Record<ExecutionStatus, true> = {
  created: true,
  skipped: true,
  blocked: true,
  stale: true,
  canceled: true,
  "needs-attention": true,
  failed: true
};

describe("domain unions", () => {
  it("enumerates all plan classifications", () => expect(Object.keys(classifications)).toHaveLength(8));
  it("enumerates all execution outcomes", () => expect(Object.keys(statuses)).toHaveLength(7));
});
