import { graphql } from "@octokit/graphql";

const USERNAME = "K-tecchan";

interface LanguageNode {
  name: string;
  color: string;
}

interface LanguageEdge {
  size: number;
  node: LanguageNode;
}

interface Repository {
  isFork: boolean;
  languages: {
    edges: LanguageEdge[];
  };
  stargazerCount: number;
}

interface ContributionsCollection {
  totalCommitContributions: number;
  restrictedContributionsCount: number;
}

interface UserResponse {
  user: {
    repositories: {
      nodes: Repository[];
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string | null;
      };
    };
    repositoriesContributedTo: { totalCount: number };
    pullRequests: { totalCount: number };
    issues: { totalCount: number };
    followers: { totalCount: number };
    contributionsCollection: ContributionsCollection;
  };
}

export interface Stats {
  totalStars: number;
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
  contributedTo: number;
}

export interface LangData {
  name: string;
  color: string;
  size: number;
  percentage: number;
}

function createClient() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN environment variable is required");
  }
  return graphql.defaults({
    headers: { authorization: `token ${token}` },
  });
}

export async function fetchStats(): Promise<Stats> {
  const gql = createClient();

  let totalStars = 0;
  let hasNextPage = true;
  let cursor: string | null = null;
  let statsData: UserResponse | null = null;

  while (hasNextPage) {
    const data = (await gql(
      `
      query ($username: String!, $after: String) {
        user(login: $username) {
          repositories(first: 100, after: $after, ownerAffiliations: OWNER, privacy: PUBLIC) {
            nodes {
              isFork
              stargazerCount
              languages(first: 1) { edges { size node { name } } }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
          repositoriesContributedTo(first: 1, contributionTypes: [COMMIT, ISSUE, PULL_REQUEST, REPOSITORY]) { totalCount }
          pullRequests(first: 1) { totalCount }
          issues(first: 1) { totalCount }
          followers { totalCount }
          contributionsCollection {
            totalCommitContributions
            restrictedContributionsCount
          }
        }
      }
      `,
      { username: USERNAME, after: cursor }
    )) as UserResponse;

    if (!statsData) {
      statsData = data;
    }

    for (const repo of data.user.repositories.nodes) {
      if (!repo.isFork) {
        totalStars += repo.stargazerCount;
      }
    }

    hasNextPage = data.user.repositories.pageInfo.hasNextPage;
    cursor = data.user.repositories.pageInfo.endCursor;
  }

  const contributions = statsData!.user.contributionsCollection;

  return {
    totalStars,
    totalCommits:
      contributions.totalCommitContributions +
      contributions.restrictedContributionsCount,
    totalPRs: statsData!.user.pullRequests.totalCount,
    totalIssues: statsData!.user.issues.totalCount,
    contributedTo: statsData!.user.repositoriesContributedTo.totalCount,
  };
}

export async function fetchLanguages(): Promise<LangData[]> {
  const gql = createClient();

  const langMap = new Map<string, { color: string; size: number }>();
  let hasNextPage = true;
  let cursor: string | null = null;

  while (hasNextPage) {
    const data = (await gql(
      `
      query ($username: String!, $after: String) {
        user(login: $username) {
          repositories(first: 100, after: $after, ownerAffiliations: OWNER, privacy: PUBLIC) {
            nodes {
              isFork
              languages(first: 20, orderBy: { field: SIZE, direction: DESC }) {
                edges {
                  size
                  node {
                    name
                    color
                  }
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
      `,
      { username: USERNAME, after: cursor }
    )) as UserResponse;

    for (const repo of data.user.repositories.nodes) {
      if (repo.isFork) continue;
      for (const edge of repo.languages.edges) {
        const existing = langMap.get(edge.node.name);
        if (existing) {
          existing.size += edge.size;
        } else {
          langMap.set(edge.node.name, {
            color: edge.node.color || "#858585",
            size: edge.size,
          });
        }
      }
    }

    hasNextPage = data.user.repositories.pageInfo.hasNextPage;
    cursor = data.user.repositories.pageInfo.endCursor;
  }

  const sorted = [...langMap.entries()]
    .map(([name, { color, size }]) => ({ name, color, size, percentage: 0 }))
    .sort((a, b) => b.size - a.size);

  const totalSize = sorted.reduce((sum, l) => sum + l.size, 0);
  for (const lang of sorted) {
    lang.percentage = (lang.size / totalSize) * 100;
  }

  return sorted;
}
