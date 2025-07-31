<template>
  <TaxonProfile :profile="profile" />
</template>

<script setup>
import { onBeforeMount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TaxonProfile from '../components/TaxonProfile.vue'
import taxaList from './constants/taxa.js'

const route = useRoute()
const router = useRouter()
const profile = ref({})

onBeforeMount(() => {
  const taxon = taxaList.find((t) => t.taxonName === route.params.name)

  if (taxon) {
    profile.value = taxon
  } else {
    router.replace({ name: 'httpError404' })
  }
})
</script>
