export type DigestFunction = (algorithm: "SHA-256", data: ArrayBuffer) => Promise<ArrayBuffer>;

export async function sha256(bytes: Uint8Array, digest: DigestFunction): Promise<string> {
  const copy = new Uint8Array(bytes);
  const result = await digest("SHA-256", copy.buffer);
  return [...new Uint8Array(result)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function equalBytes(left: Uint8Array, right: Uint8Array): boolean {
  if (left.byteLength !== right.byteLength) return false;
  return left.every((byte, index) => byte === right[index]);
}
