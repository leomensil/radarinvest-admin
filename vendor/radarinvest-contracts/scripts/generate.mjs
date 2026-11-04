#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(__dirname, "..");
const specRoot = join(pkgRoot, "../..");
const openapiSrc = join(specRoot, "04-api-contracts/openapi.yaml");
const openapiOut = join(pkgRoot, "openapi.yaml");
const distDir = join(pkgRoot, "dist");
const typesOut = join(distDir, "openapi.d.ts");
const zodRawOut = join(distDir, "zod.raw.ts");
const zodJsOut = join(distDir, "zod.js");
const zodDtsOut = join(distDir, "zod.d.ts");

mkdirSync(distDir, { recursive: true });
copyFileSync(openapiSrc, openapiOut);

const openapi = readFileSync(openapiSrc, "utf8");
const versionMatch = openapi.match(/^\s*version:\s*["']?([^\s"']+)/m);
if (versionMatch) {
  const pkgPath = join(pkgRoot, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  if (pkg.version !== versionMatch[1]) {
    pkg.version = versionMatch[1];
    writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
    console.log(`package.json version → ${pkg.version}`);
  }
}

const npx = process.platform === "win32" ? "npx.cmd" : "npx";

execFileSync(npx, ["openapi-typescript", openapiSrc, "-o", typesOut], {
  stdio: "inherit",
  cwd: pkgRoot,
});

execFileSync(
  npx,
  ["openapi-zod-client", openapiSrc, "-o", zodRawOut, "--export-schemas"],
  { stdio: "inherit", cwd: pkgRoot },
);

const raw = readFileSync(zodRawOut, "utf8");
const schemasMatch = raw.match(
  /export const schemas = \{[\s\S]*?\n\};/,
);
if (!schemasMatch) {
  throw new Error("Could not extract `export const schemas` from openapi-zod-client output");
}

// Collect schema const declarations referenced by `schemas`
const constBlocks = [...raw.matchAll(/^const (\w+) = [\s\S]*?;$/gm)].map((m) => m[0]);
const usedNames = [...schemasMatch[0].matchAll(/\b([A-Za-z_][A-Za-z0-9_]*)\b/g)]
  .map((m) => m[1])
  .filter((n) => n !== "schemas" && n !== "export" && n !== "const");

const neededConsts = constBlocks.filter((block) => {
  const name = block.match(/^const (\w+)/)?.[1];
  return name && usedNames.includes(name);
});

const zodJs = `import { z } from "zod";\n\n${neededConsts.join("\n\n")}\n\n${schemasMatch[0]}\n`;
writeFileSync(zodJsOut, zodJs);

const schemaKeys = [...schemasMatch[0].matchAll(/^\s+(\w+),?$/gm)].map((m) => m[1]);
const zodDts = `import type { z } from "zod";\n\nexport declare const schemas: {\n${schemaKeys
  .map((k) => `  ${k}: z.ZodTypeAny;`)
  .join("\n")}\n};\n`;
writeFileSync(zodDtsOut, zodDts);

unlinkSync(zodRawOut);

console.log("Generated dist/openapi.d.ts, dist/zod.js, dist/zod.d.ts, openapi.yaml");
