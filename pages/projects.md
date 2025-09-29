---
layout: home
---

<script setup lang="ts">
import GithubRepo from '../.vitepress/theme/components/GithubRepo.vue'
import data from '../data/repositories.json';

interface RepositoryInfo {
  path: string;
  preview: string;
  name: string;
  description: string;
  homepage: string;
  topics: string[];
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
}

const repositories = (data as RepositoryInfo[]).map(fields => ({
  ...fields,
  created_at: new Date(fields.created_at),
  pushed_at: new Date(fields.pushed_at),
  updated_at: new Date(fields.updated_at),
})).sort((a, b) => {
  if (a.stargazers_count === b.stargazers_count) {
    return b.created_at.getTime() - a.created_at.getTime();
  }
  return a.stargazers_count < b.stargazers_count ? 1 : -1;
});
</script>

<div class="pt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <GithubRepo
    v-for="repository of repositories"
    :key="repository.name"
    v-bind="repository"
  />
</div>
