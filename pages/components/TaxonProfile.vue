<template>
  <article class="soi min-h-screen">
    <!-- Title block -->
    <header class="border-b soi-rule">
      <div class="container max-w-screen-xl mx-auto px-4 pt-8 pb-8 sm:pt-10">
        <RouterLink
          to="/taxa"
          class="text-sm soi-link font-semibold"
          >← {{ t('allGenera') }}</RouterLink
        >
        <div class="mt-5 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <p class="soi-eyebrow">
              {{ profile.hasAccount === false ? t('genus') : t('account') }}<template v-if="profile.subfamily"> · {{ profile.subfamily }}</template>
            </p>
            <h1 class="soi-serif mt-2 text-5xl sm:text-6xl font-semibold italic tracking-tight leading-none">
              {{ profile.taxonName }}
            </h1>
            <p class="mt-3 text-lg soi-muted">{{ profile.author }}</p>
          </div>

          <div class="flex flex-wrap gap-2.5">
            <component
              :is="profile.keyUrlEN ? 'RouterLink' : 'span'"
              :to="profile.keyUrlEN || undefined"
              class="soi-btn"
              :class="profile.keyUrlEN ? 'soi-btn-ink' : 'soi-btn-off'"
              :title="profile.keyUrlEN ? 'Open the English key to species' : 'English key not available yet'"
            >
              {{ t('keyEn') }}
            </component>
            <component
              :is="profile.keyUrl ? 'RouterLink' : 'span'"
              :to="profile.keyUrl || undefined"
              class="soi-btn"
              :class="profile.keyUrl ? 'soi-btn-ink' : 'soi-btn-off'"
              :title="profile.keyUrl ? 'Apri la chiave in italiano' : 'Italian key not available yet'"
            >
              {{ t('keyIt') }}
            </component>
            <RouterLink
              v-if="profile.url"
              :to="profile.url"
              class="soi-btn soi-btn-line"
            >
              {{ t('data') }} →
            </RouterLink>
          </div>
        </div>

        <!-- Facts strip -->
        <dl class="mt-8 grid grid-cols-2 sm:grid-cols-[auto_auto_1fr] gap-x-10 gap-y-4 border-t soi-rule pt-5">
          <div v-if="profile.numSpecies">
            <dt class="text-xs font-bold uppercase tracking-[0.16em] soi-muted">{{ t('world') }}</dt>
            <dd class="soi-serif text-4xl font-semibold tabular-nums mt-1">{{ profile.numSpecies || '–' }}</dd>
          </div>
          <div>
            <dt class="text-xs font-bold uppercase tracking-[0.16em] soi-muted">{{ t('italy') }}</dt>
            <dd class="soi-serif text-4xl font-semibold tabular-nums mt-1">{{ profile.numSpeciesIta || '–' }}</dd>
          </div>
          <div
            v-if="profile.distribution?.length"
            class="col-span-2 sm:col-span-1"
          >
            <dt class="text-xs font-bold uppercase tracking-[0.16em] soi-muted">{{ t('realms') }}</dt>
            <dd class="mt-2.5 flex flex-wrap gap-2">
              <span
                v-for="region in profile.distribution"
                :key="region"
                class="px-3 py-1 text-xs font-semibold rounded-full"
                :class="distributionClassMap[region] ?? 'bg-gray-200 text-gray-700'"
              >
                {{ region }}
              </span>
            </dd>
          </div>
        </dl>
      </div>
    </header>

    <!-- Map -->
    <section
      v-if="profile.otuId"
      class="container max-w-screen-xl mx-auto px-4 pt-8"
    >
      <div class="soi-map soi-card overflow-hidden">
        <PanelDistribution
          class="h-full"
          :otu-id="profile.otuId"
          :taxon="{}"
        />
      </div>
      <p class="mt-2 text-xs soi-muted">{{ t('mapNote') }}</p>
    </section>

    <!-- Body: contents + text -->
    <div class="container max-w-screen-xl mx-auto px-4 py-10 sm:py-14 grid lg:grid-cols-12 gap-10">
      <nav
        class="lg:col-span-3 lg:sticky lg:top-6 self-start"
:aria-label="t('onPage')"
      >
        <p class="soi-eyebrow">{{ t('onPage') }}</p>
        <ol class="mt-3 border-l-2 soi-rule">
          <li
            v-for="s in sections"
            :key="s.key"
          >
            <a
              :href="`#${s.key}`"
              class="block -ml-[2px] border-l-2 border-transparent pl-4 py-1.5 text-[0.95rem] !text-[color:var(--soi-ink-soft)] hover:!text-[color:var(--soi-ink)] hover:border-[color:var(--soi-yellow)]"
              @click.prevent="jump(s.key)"
              >{{ s.title }}</a
            >
          </li>
        </ol>
      </nav>

      <div class="lg:col-span-9 max-w-3xl">
        <p
          v-if="profile.hasAccount === false"
          class="soi-pending mb-10"
        >
          {{ t('pending') }}
        </p>
        <section
          v-for="(s, i) in sections"
          :id="s.key"
          :key="s.key"
          class="scroll-mt-6"
          :class="i ? 'mt-12 pt-10 border-t soi-rule' : ''"
        >
          <h2 class="soi-serif text-2xl sm:text-3xl font-semibold">{{ s.title }}</h2>

          <ul
            v-if="s.key === 'species'"
            class="soi-species mt-5 grid sm:grid-cols-2 gap-x-8"
          >
            <li
              v-for="sp in species"
              :key="sp.id"
              class="border-b soi-rule py-2"
            >
              <component
                :is="sp.otuId ? 'RouterLink' : 'span'"
                :to="sp.otuId ? { name: 'otus-id-overview', params: { id: sp.otuId } } : undefined"
                class="!text-[color:var(--soi-ink)]"
                :class="{ 'hover:underline underline-offset-2': sp.otuId }"
              >
                <span v-html="sp.html" />
                <span class="soi-muted text-sm ml-1.5">{{ sp.author }}</span>
              </component>
            </li>
          </ul>

          <div
            v-else-if="s.key !== 'references'"
            class="soi-prose mt-4"
            v-html="profile[s.key]"
          />

          <ol
            v-else
            class="mt-5 space-y-3"
          >
            <li
              v-for="(ref, j) in profile.references"
              :key="j"
              class="soi-ref text-[0.92rem] leading-snug"
              v-html="ref"
            />
          </ol>
        </section>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import PanelDistribution from '@/modules/otus/components/Panel/PanelMap/PanelMap.vue'
import { useT } from '@/utils/soiLang.js'

const t = useT({
  en: {
    allGenera: 'All genera', account: 'Genus account', genus: 'Genus', keyEn: 'Key to species · EN', keyIt: 'Chiave · IT',
    data: 'Names, records & data', world: 'Species worldwide', italy: 'Species in Italy', realms: 'Realms',
    mapNote: 'Records in the SoI database for this genus.', onPage: 'On this page',
    introduction: 'General', diagnosis: 'Diagnosis', description: 'Description', biology: 'Biology',
    biodiversity: 'Biodiversity and distribution', italianBiodiversity: 'In Italy', species: 'Italian species', references: 'References',
    pending: 'A full account of this genus — diagnosis, biology and Italian fauna — is in preparation. Meanwhile, the species list and records below come live from the SoI database.'
  },
  it: {
    allGenera: 'Tutti i generi', account: 'Scheda del genere', genus: 'Genere', keyEn: 'Key to species · EN', keyIt: 'Chiave · IT',
    data: 'Nomi, record e dati', world: 'Specie nel mondo', italy: 'Specie in Italia', realms: 'Regioni biogeografiche',
    mapNote: 'Record presenti nel database SoI per questo genere.', onPage: 'In questa pagina',
    introduction: 'Generalità', diagnosis: 'Diagnosi', description: 'Descrizione', biology: 'Biologia',
    biodiversity: 'Biodiversità e distribuzione', italianBiodiversity: 'In Italia', species: 'Specie italiane', references: 'Bibliografia',
    pending: 'Una scheda completa di questo genere — diagnosi, biologia e fauna italiana — è in preparazione. Intanto l’elenco delle specie e i record qui sotto provengono direttamente dal database SoI.'
  }
})

const SECTIONS = ['introduction', 'diagnosis', 'description', 'biology', 'biodiversity', 'italianBiodiversity', 'species', 'references']

const distributionClassMap = {
  Palearctic: 'bg-[#f2d6d6] text-[#8f3f3f]',
  Nearctic: 'bg-[#e8efd1] text-[#5f6f2f]',
  Indomalayan: 'bg-[#f2e3cc] text-[#8b6a3e]',
  Afrotropical: 'bg-[#dde6f0] text-[#4e637f]',
  Australasian: 'bg-[#f6e2cc] text-[#9a5f24]',
  Neotropical: 'bg-[#ece5f0] text-[#715c74]'
}

const props = defineProps({
  profile: {
    type: Object,
    default: () => ({})
  },
  species: {
    type: Array,
    default: null
  }
})

const sections = computed(() =>
  SECTIONS.filter((key) => {
    if (key === 'references') return props.profile.references?.length
    if (key === 'species') return props.species?.length
    return props.profile[key]
  }).map((key) => ({ key, title: t(key) }))
)

function jump(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<style scoped>
.soi-btn-off {
  border: 1px dashed var(--soi-rule);
  color: var(--soi-ink-soft);
  cursor: not-allowed;
  opacity: 0.7;
}
.soi-map {
  height: 420px;
}
.soi-map :deep(.tp-panel),
.soi-map :deep(.card),
.soi-map :deep(> div) {
  height: 100%;
}
.soi-prose {
  font-size: 1.06rem;
  line-height: 1.75;
  color: var(--soi-ink);
}
.soi-prose :deep(p + p) {
  margin-top: 1em;
}
.soi-prose :deep(a),
.soi-ref :deep(a) {
  color: var(--soi-yellow-deep);
  text-decoration: underline;
  text-underline-offset: 2px;
  word-break: break-all;
}
.soi-pending {
  padding: 1rem 1.25rem;
  border-left: 4px solid var(--soi-yellow);
  background: var(--soi-card);
  border-radius: 4px;
  color: var(--soi-ink-soft);
  line-height: 1.6;
}
.soi-species :deep(i) {
  font-style: italic;
}
.soi-ref {
  padding-left: 1.5rem;
  text-indent: -1.5rem;
  color: var(--soi-ink-soft);
}
</style>
