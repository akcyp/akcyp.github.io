import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import type { DownloadCount, Package } from "./types/npm";
import externals from '../externals.json';

const getPackageInfo = async (name: string) => {
  const response = await fetch(`https://registry.npmjs.com/${name}`, {
    headers: {
      'Accept': 'application/json',
    },
  });
  if (response.status < 200 || response.status >= 300) {
    throw new Error(`Invalid response status: ${response.status}`);
  }
  const data = await response.json() as Package;
  return {
    description: data.description,
    keywords: data.keywords,
    created_at: data.time.created,
    modified_at: data.time.modified,
  }
};

const getPackageDownloads = async (name: string) => {
  const response = await fetch(`https://api.npmjs.org/downloads/point/last-year/${name}`, {
    headers: {
      'Accept': 'application/json',
    },
  });
  if (response.status < 200 || response.status >= 300) {
    throw new Error(`Invalid response status: ${response.status}`);
  }
  const data = await response.json() as DownloadCount;
  return {
    downloads: data.downloads,
  }
};

async function updatePackages() {
  const packages = await Promise.all(externals.packages.map(async (data) => {
    const info = await getPackageInfo(data.name);
    const { downloads } = await getPackageDownloads(data.name);
    return { ...data, ...info, downloads };
  }));
  
  const packagesFilePath = join(__dirname, '../data/packages.json');
  writeFileSync(packagesFilePath, JSON.stringify(packages, undefined, 2), 'utf-8');
}

updatePackages();
