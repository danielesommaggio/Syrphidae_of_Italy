<template>
  <span
    class="soi-rl"
    :class="`soi-rl-${code.toLowerCase()}`"
    :title="`European Red List: ${category}`"
  >
    <span class="soi-rl-code">{{ code }}</span>
    <span class="soi-rl-label">{{ label }}</span>
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { lang } from '@/utils/soiLang.js'

const props = defineProps({
  category: { type: String, required: true }
})

const CODES = {
  'Critically Endangered': ['CR', 'In pericolo critico'],
  Endangered: ['EN', 'In pericolo'],
  Vulnerable: ['VU', 'Vulnerabile'],
  'Near Threatened': ['NT', 'Quasi minacciata'],
  'Least Concern': ['LC', 'Minor preoccupazione'],
  'Data Deficient': ['DD', 'Carente di dati'],
  'Not Evaluated': ['NE', 'Non valutata'],
  Extinct: ['EX', 'Estinta']
}

const code = computed(() => CODES[props.category]?.[0] || '?')
const label = computed(() => (lang.value === 'it' ? CODES[props.category]?.[1] : props.category) || props.category)
</script>

<style scoped>
/* IUCN category colours, with the code always shown so colour is never the only cue */
.soi-rl {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--soi-ink);
}
.soi-rl-code {
  display: inline-grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: #fff;
  background: #6b6b6b;
}
.soi-rl-cr .soi-rl-code { background: #d81e05; }
.soi-rl-en .soi-rl-code { background: #fc7f3f; color: #2b1300; }
.soi-rl-vu .soi-rl-code { background: #f9e814; color: #2b2600; }
.soi-rl-nt .soi-rl-code { background: #cce226; color: #263000; }
.soi-rl-lc .soi-rl-code { background: #60c659; color: #0c2a0a; }
.soi-rl-dd .soi-rl-code { background: #d1d1c6; color: #222; }
.soi-rl-ex .soi-rl-code { background: #000; }
</style>
