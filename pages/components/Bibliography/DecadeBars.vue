<template>
  <div class="soi-dec">
    <div
      class="soi-dec-plot"
      role="group"
      :aria-label="label"
      @mouseleave="hover = null"
    >
      <button
        v-for="b in bars"
        :key="b.decade"
        type="button"
        class="soi-dec-col"
        :aria-pressed="selected === b.decade"
        :aria-label="`${b.decade}s: ${b.n}`"
        :disabled="!b.n && selected !== b.decade"
        @mouseenter="hover = b.decade"
        @focus="hover = b.decade"
        @blur="hover = null"
        @click="$emit('select', b.decade)"
      >
        <span
          class="soi-dec-bar"
          :class="{ on: selected === b.decade, dim: selected !== null && selected !== b.decade, empty: !b.n }"
          :style="{ height: b.n ? Math.max(4, (b.n / max) * 100) + '%' : '2px' }"
        />
        <span
          v-if="hover === b.decade"
          class="soi-dec-tip"
          :class="{ left: b.i > bars.length - 4, right: b.i < 3 }"
        >
          <strong>{{ b.decade }}–{{ b.decade + 9 }}</strong>
          {{ unit(b.n) }}
        </span>
      </button>
    </div>
    <div class="soi-dec-axis">
      <span
        v-for="b in bars"
        :key="b.decade"
        >{{ b.decade % 50 === 0 ? b.decade : '' }}</span
      >
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  counts: { type: Object, required: true }, // decade -> n
  from: { type: Number, required: true },
  to: { type: Number, required: true },
  selected: { type: Number, default: null },
  label: { type: String, default: '' },
  unit: { type: Function, default: (n) => String(n) }
})
defineEmits(['select'])

const hover = ref(null)
const bars = computed(() => {
  const out = []
  for (let d = props.from, i = 0; d <= props.to; d += 10, i++) out.push({ decade: d, n: props.counts[d] || 0, i })
  return out
})
const max = computed(() => Math.max(1, ...bars.value.map((b) => b.n)))
</script>

<style scoped>
.soi-dec-plot {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  gap: 2px;
  height: 150px;
  align-items: end;
  border-bottom: 1px solid var(--soi-rule);
}
.soi-dec-col {
  position: relative;
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0;
  background: none;
  border: 0;
  cursor: pointer;
}
.soi-dec-col:disabled {
  cursor: default;
}
.soi-dec-col:focus-visible {
  outline: 2px solid var(--soi-ink);
  outline-offset: 1px;
}
.soi-dec-bar {
  display: block;
  width: 78%;
  max-width: 22px;
  background: var(--soi-yellow);
  border-radius: 4px 4px 0 0;
  transition: height 0.4s ease, background 0.15s, opacity 0.15s;
}
.soi-dec-col:hover .soi-dec-bar:not(.empty) {
  background: var(--soi-yellow-deep);
}
.soi-dec-bar.on {
  background: var(--soi-yellow-deep);
}
.soi-dec-bar.dim {
  opacity: 0.35;
}
.soi-dec-bar.empty {
  background: var(--soi-rule);
}
.soi-dec-tip {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
  white-space: nowrap;
  background: var(--soi-ink);
  color: var(--soi-paper);
  font-size: 0.75rem;
  padding: 0.3rem 0.55rem;
  border-radius: 4px;
  pointer-events: none;
}
.soi-dec-tip.left {
  left: auto;
  right: 0;
  transform: none;
}
.soi-dec-tip.right {
  left: 0;
  transform: none;
}
.soi-dec-tip strong {
  display: block;
}
.soi-dec-axis {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  gap: 2px;
  margin-top: 4px;
  font-size: 0.7rem;
  color: var(--soi-ink-soft);
  font-variant-numeric: tabular-nums;
}
.soi-dec-axis span {
  overflow: visible;
  white-space: nowrap;
}
</style>
