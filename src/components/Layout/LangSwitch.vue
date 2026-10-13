<template>
  <div
    class="soi-lang-switch"
    role="group"
    aria-label="Language / Lingua"
  >
    <button
      v-for="l in ['en', 'it']"
      :key="l"
      type="button"
      :aria-pressed="lang === l"
      :class="{ on: lang === l }"
      :title="l === 'en' ? 'English' : 'Italiano'"
      @click="setLang(l)"
    >
      {{ l.toUpperCase() }}
    </button>
  </div>
</template>

<script setup>
import { lang, setLang } from '@/utils/soiLang.js'
</script>

<style scoped>
.soi-lang-switch {
  display: inline-flex;
  border: 1px solid rgb(var(--color-base-border));
  border-radius: 999px;
  padding: 2px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}
.soi-lang-switch button {
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  color: rgb(var(--color-primary-content));
  opacity: 0.6;
}
.soi-lang-switch button.on {
  background: rgb(var(--color-primary-content));
  color: rgb(var(--color-primary));
  opacity: 1;
}
</style>
