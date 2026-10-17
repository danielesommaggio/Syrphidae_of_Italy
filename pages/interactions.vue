<template>
  <div class="soi min-h-screen">
    <SoiMasthead
      :eyebrow="t('eyebrow')"
      :title="t('title')"
      :lede="t('lede')"
    />

    <section class="container mx-auto box-border px-4 py-10 sm:py-14">
      <div
        v-if="graph"
        class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
      >
        <div
          v-for="s in stats"
          :key="s.label"
          class="soi-card p-5"
        >
          <p class="soi-eyebrow">{{ s.label }}</p>
          <p class="soi-serif mt-1 text-3xl font-semibold tabular-nums">{{ s.value }}</p>
        </div>
      </div>

      <div class="soi-card p-4 sm:p-6">
        <p
          v-if="isLoading"
          class="soi-muted"
        >
          {{ t('loading') }}
        </p>
        <p
          v-else-if="!graph"
          class="soi-muted"
        >
          {{ t('none') }}
        </p>
        <template v-else>
          <p class="soi-muted text-sm mb-4">{{ t('help') }}</p>
          <ClientOnly>
            <AssociationGraph
              :graph="graph"
              searchable
              file-name="soi-interactions"
            />
          </ClientOnly>
        </template>
      </div>

      <div
        v-if="graph"
        class="soi-card p-4 sm:p-6 mt-8"
      >
        <p class="soi-eyebrow">{{ t('plantsEyebrow') }}</p>
        <h2 class="soi-serif mt-2 text-2xl font-semibold">{{ t('plantsTitle') }}</h2>
        <p class="soi-muted text-sm mt-1 mb-5">{{ t('plantsText') }}</p>
        <ClientOnly>
          <PlantFamilyChart :graph="graph" />
        </ClientOnly>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useHead } from '@unhead/vue'
import AssociationGraph from '~/panels/_shared/AssociationGraph.vue'
import PlantFamilyChart from './components/Interactions/PlantFamilyChart.vue'
import { buildGraph, fetchAssociations } from '~/panels/_shared/associationGraph.js'
import { useT } from '@/utils/soiLang.js'

const t = useT({
  en: {
    eyebrow: 'Interactions',
    title: 'Who hoverflies interact with',
    lede: 'Flowers visited, plants and prey eaten, and the parasitoids and predators that attack Italian hoverflies — every association recorded in SoI.',
    help: 'Hover a name or a line for details; click a name to open its page. Use the buttons to hide a kind of association, or find a taxon to follow its food chain.',
    plantsEyebrow: 'Plants',
    plantsTitle: 'Which plant families hoverflies use',
    plantsText: 'Flowers visited and plants fed on, counted per plant family.',
    loading: 'Loading the associations…',
    none: 'No biological associations recorded yet.',
    associations: 'Associations',
    hoverflies: 'Hoverflies',
    resources: 'Plants & prey',
    enemies: 'Natural enemies'
  },
  it: {
    eyebrow: 'Interazioni',
    title: 'Con chi interagiscono i sirfidi',
    lede: 'Fiori visitati, piante e prede di cui si nutrono, parassitoidi e predatori dei sirfidi italiani — tutte le associazioni registrate in SoI.',
    help: 'Passa sopra un nome o una linea per i dettagli; clicca un nome per aprire la sua pagina. Usa i pulsanti per nascondere un tipo di associazione, o cerca un taxon per seguirne la catena alimentare.',
    plantsEyebrow: 'Piante',
    plantsTitle: 'Quali famiglie di piante usano i sirfidi',
    plantsText: 'Fiori visitati e piante di cui si nutrono, contati per famiglia di piante.',
    loading: 'Caricamento delle associazioni…',
    none: 'Nessuna associazione biologica registrata finora.',
    associations: 'Associazioni',
    hoverflies: 'Sirfidi',
    resources: 'Piante e prede',
    enemies: 'Nemici naturali'
  }
})

useHead({ title: 'Interactions' })

const graph = ref(null)
const isLoading = ref(true)
const total = ref(0)

const stats = computed(() => [
  { label: t('associations'), value: total.value },
  { label: t('hoverflies'), value: countLevel((l) => l === 0) },
  { label: t('resources'), value: countLevel((l) => l < 0) },
  { label: t('enemies'), value: countLevel((l) => l > 0) }
])

// distinct names in the columns matching a level test
const countLevel = (test) =>
  new Set(graph.value.columns.filter((c) => test(c.level)).flatMap((c) => c.nodes.map((n) => n.name))).size

onMounted(async () => {
  try {
    const rows = await fetchAssociations()
    total.value = rows.length
    graph.value = rows.length ? await buildGraph(rows) : null
  } catch {
    graph.value = null
  } finally {
    isLoading.value = false
  }
})
</script>
