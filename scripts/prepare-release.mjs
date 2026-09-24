import { createHash } from "node:crypto";
import { access, copyFile, mkdir, readFile, readdir, rm, stat } from "node:fs/promises";
import { isAbsolute, join, relative, resolve } from "node:path";

const EXPECTED_ASSETS = ["main.js", "manifest.json", "styles.css"];

function parseArgs(argv) {
  const options = { root: process.cwd(), output: undefined, tag: undefined };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--root") options.root = argv[++index];
    else if (argument === "--output") options.output = argv[++index];
    else if (argument === "--tag") options.tag = argv[++index];
    else throw new Error(`Unknown release option: ${argument}`);
  }
  return options;
}

async function readJson(path, label) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`${label} is missing or invalid: ${reason}`);
  }
}

function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}

async function requireRegularFile(path, label) {
  try {
    const info = await stat(path);
    requireValue(info.isFile() && info.size > 0, `${label} must be a non-empty regular file.`);
  } catch (error) {
    if (error instanceof Error && error.message.endsWith("regular file.")) throw error;
    throw new Error(`${label} is missing.`);
  }
}

function ensureSafeOutput(root, output) {
  const child = relative(root, output);
  requireValue(child !== "" && child !== ".", "Release output must not be the repository root.");
  requireValue(!child.startsWith("..") && !isAbsolute(child), "Release output must remain inside the repository root.");
}

async function sha256(path) {
  return createHash("sha256").update(await readFile(path)).digest("hex");
}

async function prepareRelease({ root: requestedRoot, output: requestedOutput, tag }) {
  const root = resolve(requestedRoot);
  const packageJson = await readJson(join(root, "package.json"), "package.json");
  const manifest = await readJson(join(root, "manifest.json"), "manifest.json");
  const versions = await readJson(join(root, "versions.json"), "versions.json");

  requireValue(/^\d+\.\d+\.\d+$/.test(manifest.version ?? ""), "manifest.json version must use x.y.z semantic versioning.");
  requireValue(packageJson.version === manifest.version, "package.json and manifest.json versions must match.");
  requireValue(tag === manifest.version, `Release tag must exactly match manifest version ${manifest.version}.`);
  requireValue(manifest.id === "soundings", "manifest.json plugin id must remain soundings.");
  requireValue(!manifest.id.includes("obsidian"), "manifest.json plugin id must not contain obsidian.");
  requireValue(manifest.name === "Soundings", "manifest.json plugin name must be Soundings.");
  requireValue(manifest.isDesktopOnly === true, "manifest.json must declare the accepted desktop-only boundary.");
  requireValue(manifest.minAppVersion === "1.13.7", "manifest.json minimum Obsidian version must remain 1.13.7 for 0.1.0.");
  requireValue(typeof manifest.description === "string" && manifest.description.length <= 250 && manifest.description.endsWith("."), "manifest.json description must be no more than 250 characters and end with a period.");
  requireValue(versions[manifest.version] === manifest.minAppVersion, "versions.json must map the release version to manifest.json minAppVersion.");
  requireValue(packageJson.license === "MIT", "package.json license must be MIT.");

  const license = await readFile(join(root, "LICENSE"), "utf8");
  requireValue(license.startsWith("MIT License\n"), "LICENSE must contain the standard MIT License.");
  requireValue(license.includes("Copyright (c) 2026 Kormilo"), "LICENSE must identify the 2026 Kormilo copyright holder.");

  const readme = await readFile(join(root, "README.md"), "utf8");
  for (const heading of ["## Requirements", "## Installation", "## First use", "## Safety and privacy", "## Known limitations", "## Support", "## Development", "## License"]) {
    requireValue(readme.includes(heading), `README.md is missing required section: ${heading}.`);
  }
  for (const disclosure of ["desktop-only", "no network requests", "no client-side or server-side telemetry", "does not access files outside the active vault", "never overwritten", "MIT License"]) {
    requireValue(readme.toLowerCase().includes(disclosure.toLowerCase()), `README.md is missing required disclosure: ${disclosure}.`);
  }

  const gitignore = await readFile(join(root, ".gitignore"), "utf8");
  requireValue(gitignore.split(/\r?\n/u).includes("main.js"), ".gitignore must exclude generated main.js.");
  requireValue(gitignore.split(/\r?\n/u).includes("release/"), ".gitignore must exclude release staging.");

  for (const asset of EXPECTED_ASSETS) await requireRegularFile(join(root, asset), asset);

  const output = resolve(requestedOutput ?? join(root, "release", manifest.version));
  ensureSafeOutput(root, output);
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  for (const asset of EXPECTED_ASSETS) await copyFile(join(root, asset), join(output, asset));

  const inventory = (await readdir(output)).sort();
  requireValue(JSON.stringify(inventory) === JSON.stringify([...EXPECTED_ASSETS].sort()), `Release staging must contain exactly: ${EXPECTED_ASSETS.join(", ")}.`);
  requireValue((await readFile(join(output, "manifest.json"), "utf8")) === (await readFile(join(root, "manifest.json"), "utf8")), "Staged manifest.json must match the committed root manifest byte-for-byte.");

  const hashes = Object.fromEntries(await Promise.all(EXPECTED_ASSETS.map(async (asset) => [asset, await sha256(join(output, asset))])));
  return { version: manifest.version, output, assets: inventory, hashes };
}

const options = parseArgs(process.argv.slice(2));
try {
  await access(resolve(options.root));
  const result = await prepareRelease(options);
  process.stdout.write(`Release ${result.version} staged at ${result.output}\n`);
  for (const asset of result.assets) process.stdout.write(`${asset}  ${result.hashes[asset]}\n`);
} catch (error) {
  const reason = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Release preparation failed: ${reason}\n`);
  process.exitCode = 1;
}
