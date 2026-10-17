<template>
  <VCard
    v-if="graph && graph.links.length"
    id="soi-association-network"
  >
    <VCardHeader>{{ t('title') }}</VCardHeader>
    <VCardContent>
      <p class="text-sm text-base-content/70 mb-3">{{ t('help') }}</p>
      <ClientOnly>
        <AssociationGraph
          :graph="graph"
          :current-otu-id="otuId"
          :file-name="`${fileName}-associations`"
        />
      </ClientOnly>
    </VCardContent>
  </VCard>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import AssociationGraph from '../_shared/AssociationGraph.vue'
import { buildGraph, fetchAssociations, withPartnerAssociations } from '../_shared/associationGraph.js'
import { useT } from '@/utils/soiLang.js'

const t = useT({
  en: {
    title: 'Association network',
    help: 'Plants and prey on the left (with what the prey feed on), natural enemies on the right. Hover a name or a line for details; click a name to open its page.'
  },
  it: {
    title: 'Rete delle associazioni',
    help: 'Piante e prede a sinistra (con ciò di cui si nutrono le prede), nemici naturali a destra. Passa sopra un nome o una linea per i dettagli; clicca un nome per aprire la sua pagina.'
  }
})

const props = defineProps({
  otuId: { type: Number, required: true }
})

const graph = ref(null)
const fileName = ref('associations')

onMounted(async () => {
  try {
    // Same query as the Biological associations table, so both show the same records
    const rows = await fetchAssociations({
      'otu_query[coordinatify]': true,
      'otu_query[otu_id][]': props.otuId
    })
    // plus the partners' own associations (e.g. the aphids' host plants)
    const all = rows.length ? await withPartnerAssociations(rows) : rows
    graph.value = all.length ? await buildGraph(all, { focalOtuId: props.otuId }) : null
    fileName.value = (graph.value?.columns.find((c) => c.level === 0)?.nodes[0]?.name || 'associations')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
  } catch {
    graph.value = null
  }
})
</script>
