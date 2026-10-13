<template>
  <div class="soi-season">
    <div
      class="soi-season-plot"
      :style="{ height: height + 'px' }"
      role="img"
      :aria-label="ariaLabel"
      @mouseleave="hover = null"
    >
      <div
        v-for="(v, i) in values"
        :key="i"
        class="soi-season-col"
        @mouseenter="hover = i"
        @focus="hover = i"
        @blur="hover = null"
        tabindex="0"
      >
        <div
          class="soi-season-bar"
          :class="{ hot: hover === i, empty: !v }"
          :style="{ height: barHeight(v) }"
        />
        <div
          v-if="hover === i"
          class="soi-season-tip"
        >
          <strong>{{ monthsLong[i] }}</strong>
          {{ fmtCount(v) }}
        </div>
      </div>
    </div>
    <div class="soi-season-axis">
      <span
        v-for="(m, i) in monthsShort"
        :key="i"
        >{{ m }}</span
      >
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { lang } from '@/utils/soiLang.js'

const props = defineProps({
  values: { type: Array, required: true }, // 12 numbers (null = loading)
  height: { type: Number, default: 140 },
  unit: { type: String, default: 'records' }
})

const LONG = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  it: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']
}
const monthsLong = computed(() => LONG[lang.value] || LONG.en)
const monthsShort = computed(() => monthsLong.value.map((m) => m[0]))

const hover = ref(null)
const max = computed(() => Math.max(1, ...props.values.map((v) => v || 0)))

function barHeight(v) {
  if (!v) return '2px'
  return Math.max(4, (v / max.value) * 100) + '%'
}

function fmtCount(v) {
  if (v === null || v === undefined) return '…'
  const n = v.toLocaleString('en-US')
  if (props.unit === 'records') return lang.value === 'it' ? `${n} record` : `${n} ${v === 1 ? 'record' : 'records'}`
  return `${n} ${props.unit}`
}

const ariaLabel = computed(() =>
  props.values.map((v, i) => `${monthsLong.value[i]} ${v ?? 0}`).join(', ')
)
</script>

<style scoped>
.soi-season-plot {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 2px;
  align-items: end;
  border-bottom: 1px solid var(--soi-rule);
}
.soi-season-col {
  position: relative;
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  outline: none;
  cursor: default;
}
.soi-season-bar {
  width: 72%;
  max-width: 26px;
  background: var(--soi-yellow);
  border-radius: 4px 4px 0 0;
  transition: height 0.6s ease, background 0.15s;
}
.soi-season-bar.empty {
  background: var(--soi-rule);
}
.soi-season-bar.hot {
  background: var(--soi-yellow-deep);
}
.soi-season-tip {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  background: var(--soi-ink);
  color: var(--soi-paper);
  font-size: 0.75rem;
  padding: 0.3rem 0.55rem;
  border-radius: 4px;
  z-index: 5;
  display: flex;
  gap: 0.35rem;
}
.soi-season-axis {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 2px;
  margin-top: 0.35rem;
  text-align: center;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--soi-ink-soft);
}
</style>
