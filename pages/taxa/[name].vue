<template>
  <TaxonProfile
    v-if="profile"
    :profile="profile"
    :species="species"
  />
  <div
    v-else
    class="soi min-h-screen"
  >
    <div class="container mx-auto px-4 py-16 soi-muted">…</div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { makeAPIRequest } from '@/utils/request'
import { useHead } from '@unhead/vue'
import TaxonProfile from '../components/TaxonProfile.vue'
import { accountFor, useGenera } from './useGenera.js'

const route = useRoute()
const router = useRouter()
const genera = useGenera()
const species = ref(null)

const name = computed(() => route.params.name)

const profile = computed(() => {
  const account = accountFor(name.value)
  const live = genera.list.find((g) => g.taxonName === name.value)
  if (!account && !live) return null
  return {
    ...(live || {}),
    ...(account || {}),
    author: account?.author || live?.author,
    numSpeciesIta: live?.numSpeciesIta ?? account?.numSpeciesIta,
    numSpecies: account?.numSpecies || live?.numSpecies,
    subfamily: live?.subfamily || '',
    otuId: live?.otuId || account?.otuId,
    url: account?.url || (live?.otuId ? `/otus/${live.otuId}/overview` : null),
    keyUrl: live?.keyLinkIT ? `/key/${live.keyLinkIT.params.id}` : account?.keyUrl || '',
    keyUrlEN: live?.keyLinkEN ? `/key/${live.keyLinkEN.params.id}` : account?.keyUrlEN || '',
    hasAccount: !!account
  }
})

useHead({
  title: () => `${name.value} — Syrphidae of Italy`,
  meta: [{ name: 'description', content: () => `${name.value}: Italian species, distribution and identification keys in Syrphidae of Italy (SoI).` }]
})

// 404 once the live list has loaded and the genus is unknown
watch(
  () => genera.loading,
  (loading) => {
    if (!loading && !profile.value) router.replace({ name: 'httpError404' })
  },
  { immediate: true }
)

// Species of the genus, with OTU links
watch(
  () => genera.speciesByGenus[name.value],
  async (list) => {
    if (!list) return
    species.value = list.map((s) => ({ ...s, otuId: null }))
    if (!list.length) return
    try {
      const { data } = await makeAPIRequest.get('/otus', {
        params: { taxon_name_id: list.map((s) => s.id), per: 1000 }
      })
      const byTn = new Map((data || []).map((o) => [o.taxon_name_id, o.id]))
      species.value = list.map((s) => ({ ...s, otuId: byTn.get(s.id) || null }))
    } catch {
      // names stay unlinked
    }
  },
  { immediate: true }
)
</script>
