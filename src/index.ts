import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchStats, fetchLanguages } from "./github-api.js";
import { generateStatsCard } from "./stats-card.js";
import { generateLangsCard } from "./langs-card.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const imagesDir = join(__dirname, "..", "images");

async function main() {
  mkdirSync(imagesDir, { recursive: true });

  console.log("Fetching GitHub stats...");
  const [stats, languages] = await Promise.all([
    fetchStats(),
    fetchLanguages(),
  ]);

  console.log("Stats:", stats);
  console.log(
    "Top languages:",
    languages.slice(0, 8).map((l) => `${l.name}: ${l.percentage.toFixed(1)}%`)
  );

  const statsSvg = generateStatsCard(stats);
  const langsSvg = generateLangsCard(languages);

  writeFileSync(join(imagesDir, "stats.svg"), statsSvg);
  writeFileSync(join(imagesDir, "top-langs.svg"), langsSvg);

  console.log("SVGs generated in images/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
