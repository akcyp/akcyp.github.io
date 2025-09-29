export interface DownloadCount {
  package: string;
  start: string;
  end: string;
  downloads: number;
}

export interface Package {
  _id: string;
  _rev: string;
  name: string;
  "dist-tags": { latest: string };
  versions: Record<string, {}>;
  time: {
    created: string;
    modified: string;
    [k: `${number}.${number}.${number}`]: string;
  };
  maintainers: { name: string; email: string }[];
  description: string;
  homepage: string;
  keywords: string[];
  license: string;
  readme: string;
  readmeFilename: string;
}
