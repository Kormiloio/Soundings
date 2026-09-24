import { webcrypto } from "node:crypto";
import type { DigestFunction } from "../src/core/hash";

export const testDigest: DigestFunction = (algorithm, data) => webcrypto.subtle.digest(algorithm, data);
