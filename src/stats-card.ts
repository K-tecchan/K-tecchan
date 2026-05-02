import type { Stats } from "./github-api.js";

const CARD_WIDTH = 495;
const BG_COLOR = "#0d1117";
const TITLE_COLOR = "#58a6ff";
const TEXT_COLOR = "#c9d1d9";
const ICON_COLOR = "#58a6ff";

function formatNumber(n: number): string {
  if (n >= 1000) {
    return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return n.toString();
}

interface StatItem {
  icon: string;
  label: string;
  value: string;
}

function starIcon(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="${ICON_COLOR}"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25z"/></svg>`;
}

function commitIcon(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="${ICON_COLOR}"><path d="M11.93 8.5a4.002 4.002 0 0 1-7.86 0H.75a.75.75 0 0 1 0-1.5h3.32a4.002 4.002 0 0 1 7.86 0h3.32a.75.75 0 0 1 0 1.5Zm-1.43-.5a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z"/></svg>`;
}

function prIcon(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="${ICON_COLOR}"><path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z"/></svg>`;
}

function issueIcon(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="${ICON_COLOR}"><path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"/></svg>`;
}

function repoIcon(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="${ICON_COLOR}"><path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"/></svg>`;
}

export function generateStatsCard(stats: Stats): string {
  const items: StatItem[] = [
    { icon: starIcon(), label: "Total Stars", value: formatNumber(stats.totalStars) },
    { icon: commitIcon(), label: "Total Commits", value: formatNumber(stats.totalCommits) },
    { icon: prIcon(), label: "Total PRs", value: formatNumber(stats.totalPRs) },
    { icon: issueIcon(), label: "Total Issues", value: formatNumber(stats.totalIssues) },
    { icon: repoIcon(), label: "Contributed to", value: formatNumber(stats.contributedTo) },
  ];

  const lineHeight = 28;
  const startY = 55;
  const cardHeight = startY + items.length * lineHeight + 20;

  const rows = items
    .map((item, i) => {
      const y = startY + i * lineHeight;
      return `
      <g transform="translate(25, ${y})">
        <g transform="translate(0, -6)">${item.icon}</g>
        <text x="26" y="0" fill="${TEXT_COLOR}" font-size="14" font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', Sans-Serif">${item.label}:</text>
        <text x="${CARD_WIDTH - 50}" y="0" fill="${TEXT_COLOR}" font-size="14" font-weight="bold" font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', Sans-Serif" text-anchor="end">${item.value}</text>
      </g>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${cardHeight}" viewBox="0 0 ${CARD_WIDTH} ${cardHeight}">
  <rect x="0.5" y="0.5" width="${CARD_WIDTH - 1}" height="${cardHeight - 1}" rx="4.5" fill="${BG_COLOR}" stroke="#30363d"/>
  <text x="25" y="35" fill="${TITLE_COLOR}" font-size="18" font-weight="bold" font-family="'Segoe UI', Ubuntu, 'Helvetica Neue', Sans-Serif">K-tecchan's GitHub Stats</text>
  ${rows}
</svg>`;
}
