<template>
  <div>
    <p class="soi-eyebrow capitalize">
      {{ store.taxon.rank || 'Combination' }}
      <span
        class="soi-status"
        :class="store.taxon.is_valid ? 'soi-status-ok' : 'soi-status-no'"
        :title="store.taxon.short_status"
        >{{ store.taxon.is_valid ? t('valid') : t('invalid') }}</span
      >
    </p>
    <h1 class="soi-taxon-title soi-serif mt-2 text-4xl sm:text-5xl leading-tight font-semibold">
      <span>
        <span
          :title="store.taxon.short_status"
          v-html="store.taxon.full_name_tag"
        />
        <span
          v-if="!store.taxon.is_valid"
          class="ml-1 text-red-600 text-2xl"
          title="Invalid"
        >
          &#10005;
        </span>
        <span
          v-if="store.taxon.descorator_status.length"
          class="text-base-soft text-base"
        >
          ({{ store.taxon.descorator_status.join('; ') }})
        </span>
      </span>
    </h1>
    <span class="block mt-1 text-lg soi-muted">
      <CommonNames />
    </span>
  </div>
</template>

<script setup>
import { useOtuStore } from '../store/store'
import CommonNames from './CommonNames.vue'
import { useT } from '@/utils/soiLang.js'

const t = useT({ en: { valid: 'valid', invalid: 'not valid' }, it: { valid: 'valido', invalid: 'non valido' } })

const store = useOtuStore()
</script>

<style scoped>
.soi-taxon-title {
  font-weight: 400;
  color: var(--soi-ink-soft);
}
.soi-taxon-title :deep(i) {
  font-style: italic;
  font-weight: 600;
  color: var(--soi-ink);
}
.soi-status {
  display: inline-block;
  margin-left: 0.6rem;
  padding: 0.05rem 0.5rem;
  border-radius: 999px;
  font-size: 0.65rem;
  letter-spacing: 0.1em;
  vertical-align: 1px;
}
.soi-status-ok {
  background: color-mix(in srgb, var(--soi-olive) 16%, transparent);
  color: var(--soi-olive);
}
.soi-status-no {
  background: color-mix(in srgb, var(--soi-terra) 16%, transparent);
  color: var(--soi-terra);
}
</style>
