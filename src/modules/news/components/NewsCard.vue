<template>
  <article class="soi-news-card overflow-hidden">
    <div class="p-6">
      <div
        v-if="date"
        class="flex items-center gap-2 mb-3"
      >
        
        <span class="text-xs font-bold uppercase tracking-[0.14em] text-[color:var(--soi-yellow-deep)]">{{ news.createdAt }}</span>
      </div>

      <h3 class="soi-serif text-2xl font-semibold mb-3 leading-snug">
        <RouterLink
          :to="`/news/${news.id}`"
          class="!text-[color:var(--soi-ink)] hover:underline underline-offset-4"
          >{{ news.title }}</RouterLink
        >
      </h3>
      <p
        class="mb-1 line-clamp-3 text-[color:var(--soi-ink-soft)] leading-relaxed"
        v-html="news.content"
      />
    </div>
  </article>
</template>

<script setup>
const props = defineProps({
  news: {
    type: Object,
    required: true
  },

  date: {
    type: Boolean,
    default: true
  }
})
</script>

<style scoped>
.soi-news-card {
  background: var(--soi-card);
  border: 1px solid var(--soi-rule);
  border-top: 4px solid var(--soi-yellow);
  border-radius: 6px;
}
</style>
