import type { LangData } from "./github-api.js";

const CARD_WIDTH = 350;
const BG_COLOR = "#0d1117";
const TITLE_COLOR = "#58a6ff";
const TEXT_COLOR = "#c9d1d9";
const BAR_HEIGHT = 8;
const MAX_LANGS = 8;
const COLUMNS = 2;

export function generateLangsCard(languages: LangData[]): string {
  const topLangs = languages.slice(0, MAX_LANGS);
  const otherSize = languages.slice(MAX_LANGS).reduce((s, l) => s + l.size, 0);
  const totalSize = languages.reduce((s, l) => s + l.size, 0);

  if (otherSize > 0) {
    topLangs.push({
      name: "Other",
      color: "#858585",
      size: otherSize,
      percentage: (otherSize / totalSize) * 100,
    });
  }

  // Bar segments
  const barY = 50;
  const barWidth = CARD_WIDTH - 50;
  let barX = 25;
  const barSegments = topLangs
    .map((lang) => {
      const width = (lang.percentage / 100) * barWidth;
      const segment = `<rect x="${barX}" y="${barY}" width="${Math.max(width, 1)}" height="${BAR_HEIGHT}" fill="${lang.color}" rx="${barX === 25 ? 4 : 0}" ry="${barX === 25 ? 4 : 0}" mask="url(#bar-mask)"/>`;
      barX += width;
      return segment;
    })
    .join("");

  // Language grid
  const gridStartY = barY + BAR_HEIGHT + 24;
  const colWidth = (CARD_WIDTH - 50) / COLUMNS;
  const langItems = topLangs
    .map((lang, i) => {
      const col = i % COLUMNS;
      const row = Math.floor(i / COLUMNS);
      const x = 25 + col * colWidth;
      const y = gridStartY + row * 24;
      return `
      <g transform="translate(${x}, ${y})">
        <circle cx="5" cy="-4" r="5" fill="${lang.color}"/>
        <text x="16" y="0" fill="${TEXT_COLOR}" font-size="12" font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', Sans-Serif">${lang.name} <tspan fill="#8b949e">${lang.percentage.toFixed(1)}%</tspan></text>
      </g>`;
    })
    .join("");

  const rows = Math.ceil(topLangs.length / COLUMNS);
  const cardHeight = gridStartY + rows * 24 + 16;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${cardHeight}" viewBox="0 0 ${CARD_WIDTH} ${cardHeight}">
  <defs>
    <mask id="bar-mask">
      <rect x="25" y="${barY}" width="${barWidth}" height="${BAR_HEIGHT}" rx="4" fill="white"/>
    </mask>
  </defs>
  <rect x="0.5" y="0.5" width="${CARD_WIDTH - 1}" height="${cardHeight - 1}" rx="4.5" fill="${BG_COLOR}" stroke="#30363d"/>
  <text x="25" y="35" fill="${TITLE_COLOR}" font-size="18" font-weight="bold" font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', Sans-Serif">Most Used Languages</text>
  ${barSegments}
  ${langItems}
</svg>`;
}
