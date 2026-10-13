<template>
  <header class="mb-8">
    <p class="soi-eyebrow">{{ t('eyebrow') }}</p>
    <div class="mt-3 grid lg:grid-cols-12 gap-6 lg:gap-12 items-end">
      <h1 class="lg:col-span-6 soi-serif text-4xl sm:text-5xl font-semibold leading-[1.05] tracking-tight">
        {{ t('title') }}
      </h1>
      <p class="lg:col-span-6 text-lg leading-relaxed soi-muted">
        {{ t('lede') }}
      </p>
    </div>

    <dl class="mt-8 flex flex-wrap gap-x-10 gap-y-4 border-y soi-rule py-4">
      <div
        v-for="s in summary"
        :key="s.label"
        class="flex items-baseline gap-2"
      >
        <dd class="soi-serif text-3xl font-semibold tabular-nums">{{ s.value }}</dd>
        <dt class="text-sm soi-muted">{{ s.label }}</dt>
      </div>
      <div class="ml-auto self-center text-sm soi-muted">
        <span class="font-semibold text-[color:var(--soi-ink)]">{{ t('tip') }}</span>
        {{ t('tipText') }}
      </div>
    </dl>
  </header>
</template>

<script setup>
import { useT } from '@/utils/soiLang.js'

const t = useT({
  en: {
    eyebrow: 'Genera',
    title: 'The genera of Italian hoverflies',
    lede: 'Every genus in the catalogue, counted live from TaxonWorks: author, subfamily, species in Italy and identification keys. Genera marked “Account” also have a full written account with world richness and realms.',
    tip: 'Tip:',
    tipText: 'click a realm code to see its map.'
  },
  it: {
    eyebrow: 'Generi',
    title: 'I generi dei sirfidi italiani',
    lede: 'Tutti i generi del catalogo, conteggiati in tempo reale da TaxonWorks: autore, sottofamiglia, specie in Italia e chiavi di identificazione. I generi con l’etichetta “Scheda” hanno anche una scheda completa con ricchezza mondiale e regioni biogeografiche.',
    tip: 'Suggerimento:',
    tipText: 'clicca il codice di una regione per vederne la mappa.'
  }
})
defineProps({
  summary: {
    type: Array,
    default: () => []
  }
})
</script>
