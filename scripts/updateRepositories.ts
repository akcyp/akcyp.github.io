import type { Repository } from "./types/github";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import externals from '../externals.json';

const getRepoInfo = async (path: string) => {
  const token = process.env.GH_TOKEN;
  const response = await fetch(`https://api.github.com/repos/${path}`, {
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (response.status < 200 || response.status >= 300) {
    throw new Error(`Invalid response status: ${response.status}`);
  }
  const data = await response.json() as Repository;
  return {
    name: data.name,
    description: data.description,
    homepage: data.homepage,
    topics: data.topics,
    html_url: data.html_url,
    stargazers_count: data.stargazers_count,
    forks_count: data.forks_count,
    language: data.language,
    created_at: data.created_at,
    pushed_at: data.pushed_at,
    updated_at: data.updated_at,
  }
};

async function updateRepositories() {
  const repositories = await Promise.all(externals.repositories.map(async (data) => {
    const info = await getRepoInfo(data.path);
    return { ...data, ...info };
  }));
  const repositoriesFilePath = join(__dirname, '../data/repositories.json');
  const dataDir = dirname(repositoriesFilePath);
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
  writeFileSync(repositoriesFilePath, JSON.stringify(repositories, undefined, 2), 'utf-8');
}

updateRepositories();
