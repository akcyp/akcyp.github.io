---
layout: home
---

<script setup lang="ts">
import NpmPackage from '../.vitepress/theme/components/NpmPackage.vue'
import data from '../data/packages.json';
interface PackageInfo {
  name: string;
  description: string;
  keywords: string[];
  created_at: string;
  modified_at: string;
  downloads: number;
}

const packages = (data as PackageInfo[]).sort((a, b) => {
  return b.downloads - a.downloads;
});
</script>

<div class="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <NpmPackage
    v-for="pkg of packages"
    :key="pkg.name"
    v-bind="pkg"
  />
</div>
