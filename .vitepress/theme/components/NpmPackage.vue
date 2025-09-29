<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  name: String,
  description: String,
  keywords: Array<string>,
  created_at: String,
  modified_at: String,
  downloads: Number,
  preview: String,
});

const homepage = computed(() => `https://www.npmjs.com/package/${props.name}`);

</script>

<template>
  <div class="flex flex-col shadow-md bg-default">
    <a v-if="preview" :href="homepage">
      <img class="rounded-t-lg object-cover h-48 w-full object-center" :src="preview" :alt="name" rel="preload" />
    </a>
    <div class="flex-1 flex justify-between flex-col p-8 w-full">
      <div>
        <div class="flex items-center truncate">
          <a :href="homepage" class="flex gap-2 items-center text-lg tracking-wide flex opacity-60 !no-underline !color-inherit !font-inherit">
            <div class="i-cil-link-alt size-1em" />
            <span>{{ props.name }}</span>
          </a>
        </div>
        <p class="mt-1 text-sm">
          {{ props.description }}
        </p>
        <div class="mt-1 mb-5 text-sm flex gap-2 flex-wrap">
          <div
            v-for="tag of (props.keywords ?? [])"
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
            <div class="i-cil-cloud-download size-1em" />
            <span>{{ props.downloads }} downloads in last year</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
