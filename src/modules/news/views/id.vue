<template>
  <div class="container mx-auto h-full px-4 py-10 max-w-4xl">
    <VCard class="overflow-hidden h-full">
      <VSpinner
        v-if="isLoading"
        full-screen
      />
      <article v-if="news">
        <div class="md:flex h-full">
          <div class="p-8 md:p-10 w-full flex flex-col justify-between">
            <div>
              <div class="mb-6">
                <p class="soi-eyebrow mb-3">News</p>
                <h1 class="soi-serif text-4xl sm:text-5xl font-semibold leading-tight">
                  {{ news.title }}
                </h1>
                <span class="block mt-3 text-sm soi-muted">
                  <template v-if="show_author">{{ news.creator }}</template>
                  <template v-if="show_author && show_date"> — </template>
                  <template v-if="show_date">{{ news.createdAt }}</template>
                </span>
              </div>
              <div
                class="prose prose-lg max-w-none dark:prose-invert leading-relaxed mb-6"
                v-html="news.content"
              />
            </div>
            <RouterLink
              to="/news"
              class="soi-link font-semibold flex flex-row gap-2 items-center mt-6"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-4"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                ></path>
              </svg>
              Back to news
            </RouterLink>
          </div>
        </div>
      </article>
    </VCard>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { News } from '../services/News'
import { useRoute } from 'vue-router'
import { makeNews } from '../adapters/makeNews'

const route = useRoute()
const newsId = route.params.id
const news = ref(null)
const isLoading = ref(true)

const { news_module = {} } = __APP_ENV__

const { news_page: { show_author = true, show_date = true } = {} } = news_module

News.find(newsId)
  .then(({ data }) => {
    news.value = makeNews(data)
  })
  .catch(() => {})
  .finally(() => {
    isLoading.value = false
  })
</script>
