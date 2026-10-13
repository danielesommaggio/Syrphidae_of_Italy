<template>
  <div class="soi min-h-screen">
    <header class="border-b soi-rule">
      <div class="container mx-auto px-4 pt-12 pb-8 sm:pt-16">
        <p class="soi-eyebrow">{{ t('eyebrow') }}</p>
        <div class="mt-3 grid lg:grid-cols-12 gap-6 items-end">
          <h1 class="lg:col-span-7 soi-serif text-4xl sm:text-5xl font-semibold leading-[1.05] tracking-tight">
            {{ title }}
          </h1>
          <p class="lg:col-span-5 text-lg leading-relaxed soi-muted">
            <slot name="lede" />
          </p>
        </div>

        <nav
          class="mt-8 flex gap-2"
          :aria-label="t('eyebrow')"
        >
          <RouterLink
            v-for="tab in tabs"
            :key="tab.to"
            :to="tab.to"
            class="soi-tab"
            :class="{ 'soi-tab-on': tab.kind === kind }"
            >{{ t(tab.key) }}</RouterLink
          >
        </nav>
      </div>
    </header>

    <div class="container mx-auto px-4 py-10 sm:py-14 grid lg:grid-cols-12 gap-10">
      <div class="lg:col-span-8">
        <RecentLog :kind="kind" />
      </div>
      <aside class="lg:col-span-4">
        <div class="soi-card p-6 lg:sticky lg:top-6">
          <p class="soi-eyebrow">{{ t('help') }}</p>
          <p class="mt-3 leading-relaxed">
            <slot name="aside" />
          </p>
          <RouterLink
            to="/about"
            class="soi-btn soi-btn-line mt-5"
            >{{ t('contact') }}</RouterLink
          >
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import RecentLog from './RecentLog.vue'
import { useT } from '@/utils/soiLang.js'

const t = useT({
  en: { eyebrow: 'Latest additions', help: 'Help us improve', contact: 'Contact the curators', names: 'Names', refs: 'References' },
  it: { eyebrow: 'Ultime aggiunte', help: 'Aiutaci a migliorare', contact: 'Contatta i curatori', names: 'Nomi', refs: 'Riferimenti' }
})

defineProps({
  kind: { type: String, required: true },
  title: { type: String, required: true }
})

const tabs = [
  { kind: 'taxa', key: 'names', to: '/newtaxa' },
  { kind: 'sources', key: 'refs', to: '/newreferences' }
]
</script>

<style scoped>
.soi-tab {
  padding: 0.45rem 1.1rem;
  border-radius: 999px;
  border: 1px solid var(--soi-rule);
  font-weight: 600;
  font-size: 0.92rem;
  color: var(--soi-ink-soft);
}
.soi-tab:hover {
  color: var(--soi-ink);
  border-color: var(--soi-ink);
}
.soi-tab-on {
  background: var(--soi-ink);
  border-color: var(--soi-ink);
  color: var(--soi-paper) !important;
}
</style>
