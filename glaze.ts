#!/usr/bin/env node

/**
 * Thin wrapper that resolves the glaze CLI from the Glaze SDK.
 * Uses explicit SDK paths so `npm run build` etc. work without
 * relying on PATH.
 */

import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const candidates = [
  resolve(__dirname, "../glaze-core/cli/glaze.js"),
  resolve(__dirname, "../../../sdk/current/@glaze/core/cli/glaze.js"),
];

const cli = candidates.find(existsSync);
if (!cli) {
  console.error("[glaze] CLI not found. Searched:");
  candidates.forEach((p) => console.error(`  - ${p}`));
  process.exit(1);
}

await import(cli);
