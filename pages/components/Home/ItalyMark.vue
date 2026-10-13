<template>
  <svg
    :viewBox="VIEWBOX"
    class="soi-mark"
    role="img"
    :aria-label="label"
  >
    <defs>
      <pattern
        id="soi-stripes"
        width="18"
        height="18"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(-35)"
      >
        <rect
          width="18"
          height="18"
          class="soi-mark-bg"
        />
        <rect
          width="9"
          height="18"
          class="soi-mark-stripe"
        />
      </pattern>
    </defs>

    <!-- Outline: thick stroke underneath, fills on top hide the inner borders -->
    <g class="soi-mark-outline">
      <path
        v-for="r in shapes"
        :key="'o' + r.name"
        :d="r.d"
      />
    </g>
    <g class="soi-mark-fill">
      <path
        v-for="r in shapes"
        :key="'f' + r.name"
        :d="r.d"
      />
    </g>
  </svg>
</template>

<script setup>
import shapes, { VIEWBOX } from '../Atlas/italyRegions.js'

defineProps({
  label: { type: String, default: 'Italy' }
})
</script>

<style scoped>
.soi-mark {
  width: 100%;
  height: auto;
  display: block;
  overflow: visible;
}
.soi-mark-outline path {
  fill: none;
  stroke: #22281c;
  stroke-width: 7;
  stroke-linejoin: round;
}
.soi-mark-fill path {
  fill: url(#soi-stripes);
  stroke: url(#soi-stripes);
  stroke-width: 1;
  stroke-linejoin: round;
}
.soi-mark-bg {
  fill: #22281c;
}
.soi-mark-stripe {
  fill: var(--soi-yellow);
}
</style>
