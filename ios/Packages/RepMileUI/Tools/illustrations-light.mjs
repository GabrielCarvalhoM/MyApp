#!/usr/bin/env node
// #94 · Light ("A · Claro") variants of the line-art illustrations (Figma `Traço/*`, page 02, nodes 552:*).
// Every colour of those components is bound to a variable of "Repmile · Cor"; the exported SVGs carry the dark ("A · Sem acento") values.
// This maps each dark value to the same variable's light value (valuesByMode, 2026-11-27) and writes `<name>-claro.svg` beside the dark one.
// Nothing else changes (paths, widths, caps). Re-run after replacing a dark SVG:  node ios/Packages/RepMileUI/Tools/illustrations-light.mjs [--check]
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const assets = join(dirname(fileURLToPath(import.meta.url)), "../Sources/RepMileUI/Resources/Assets.xcassets");
// variable: dark (as exported) → light
const map = new Map([
  ["#F3F4F6", "#0C0D10"], // texto/primario
  ["#7C818B", "#6B707A"], // texto/terciario
  ["#0C0D10", "#F3F4F6"], // fundo/app (knockout fill)
  ["white", "#0C0D10"],   // agora
]);
const check = process.argv.includes("--check");
let bad = 0;
for (const set of readdirSync(assets).filter((d) => d.startsWith("traco-") && d.endsWith(".imageset"))) {
  const name = set.replace(/\.imageset$/, "");
  const dark = readFileSync(join(assets, set, `${name}.svg`), "utf8");
  const light = dark.replace(/(stroke|fill)="([^"]+)"/g, (m, attr, value) => {
    if (value === "none") return m;
    const key = value.startsWith("#") ? value.toUpperCase() : value.toLowerCase();
    if (!map.has(key)) throw new Error(`${name}: colour ${value} is not a mapped Repmile · Cor variable`);
    return `${attr}="${map.get(key)}"`;
  });
  const out = join(assets, set, `${name}-claro.svg`);
  if (check) {
    if (!existsSync(out) || readFileSync(out, "utf8") !== light) { console.error(`stale: ${out}`); bad++; }
  } else writeFileSync(out, light);
  const contents = {
    images: [
      { filename: `${name}-claro.svg`, idiom: "universal" },
      { appearances: [{ appearance: "luminosity", value: "dark" }], filename: `${name}.svg`, idiom: "universal" },
    ],
    info: { author: "xcode", version: 1 },
    properties: { "preserves-vector-representation": true },
  };
  const cj = JSON.stringify(contents, null, 1) + "\n";
  const cp = join(assets, set, "Contents.json");
  if (check) { if (readFileSync(cp, "utf8") !== cj) { console.error(`stale: ${cp}`); bad++; } } else writeFileSync(cp, cj);
  console.log(`${check ? "checked" : "wrote"} ${name}`);
}
process.exit(bad ? 1 : 0);
