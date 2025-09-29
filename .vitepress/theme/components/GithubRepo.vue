<script setup lang="ts">
import { computed } from 'vue';
import { languageColors } from '../constants/languageColors';

const props = defineProps({
  path: String,
  preview: String,
  name: String,
  description: String,
  homepage: String,
  topics: Array<string>,
  html_url: String,
  stargazers_count: Number,
  forks_count: Number,
  language: String,
});

const langColor = computed(() => languageColors[props.language] ?? 'black');
</script>

<template>
  <div class="flex flex-col shadow-md bg-default">
    <a v-if="preview" :href="props.homepage || props.html_url">
      <img class="rounded-t-lg object-cover h-48 w-full object-center" :src="preview" :alt="name" />
    </a>
    <div class="flex-1 flex justify-between flex-col p-8 w-full">
      <div>
        <div class="flex items-center truncate">
          <a :href="props.html_url" class="flex gap-2 items-center text-lg tracking-wide flex opacity-60 !no-underline !color-inherit !font-inherit">
            <div class="i-cil-link-alt size-1em" />
            <span>{{ props.name }}</span>
          </a>
        </div>
        <p class="mt-1 text-sm">
          {{ props.description }}
        </p>
        <div class="mt-1 mb-5 text-sm flex gap-2 flex-wrap">
          <div
            v-for="tag of (props.topics ?? [])"
            :key="tag"
            class="inline-flex items-center rounded-md bg-gray-400/10 px-2 py-1 text-xs font-medium text-gray-400 inset-ring inset-ring-gray-400/20"
          >
            {{ tag }}
          </div>
        </div>
      </div>
      <div class="flex justify-between text-sm truncate">
        <div class="flex grow">
          <span class="mr-3 flex items-center gap-1">
            <div class="i-cil-star size-1em" />
            <span>{{ props.stargazers_count }}</span>
          </span>
          <span class="flex items-center gap-1">
            <div class="i-cil-fork size-1em" />
            <span>{{ props.forks_count }}</span>
          </span>
        </div>
        <div>
          <span class="flex items-center">
            <div class="w-3 h-3 rounded-full mr-1 opacity-60" :style="`background-color: ${langColor};`"></div>
            <span>{{ props.language }}</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
