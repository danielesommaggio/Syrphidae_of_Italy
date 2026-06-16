<template>
  <section>
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 divide-x divide-white/10">
        <DataType
          v-for="(item, key) in dataTypes"
          :key="key"
          :icon="item.icon"
          :label="item.label"
          :count="item.count"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { makeAPIRequest } from '@/utils/request'
import { shallowRef, triggerRef } from 'vue'

import IconBug from '../Icon/IconBug.vue'
import IconImage from '../Icon/IconImage.vue'
import IconMicroscope from '../Icon/IconMicroscope.vue'
import IconOk from '../Icon/IconOk.vue'
import IconReference from '../Icon/IconReference.vue'
import IconCitation from '../Icon/iconCitation.vue'
import IconX from '../Icon/IconX.vue'

import DataType from './Data/DataType.vue'

const SYRPHIDAE_ID = 1095229

const TYPES = {
  validSpecies: 'Valid species',
  genera: 'Genera',
  invalidSpecies: 'Invalid species',
  projectSources: 'Project sources',
  collectionObjects: 'Collection objects',
  citations: 'Citations',
  images: 'Images'
}

const dataTypes = shallowRef({
  [TYPES.validSpecies]: {
    icon: IconOk,
    label: 'Valid species',
    count: 30000
  },
  [TYPES.genera]: {
    icon: IconOk,
    label: 'Genus group names',
    count: 1000
  },
  [TYPES.invalidSpecies]: {
    icon: IconX,
    label: 'Invalid species',
    count: 25000
  },
  [TYPES.projectSources]: {
    icon: IconReference,
    label: 'References',
    count: 15500
  },
  [TYPES.citations]: {
    icon: IconCitation,
    label: 'Citations',
    count: 250000
  },
  [TYPES.images]: {
    icon: IconImage,
    label: 'Images',
    count: 100
  },
  [TYPES.collectionObjects]: {
    icon: IconBug,
    label: 'Specimen records',
    count: 108000
  }
})

makeAPIRequest('/stats').then((response) => {
  const { data } = response.data

  for (const key in data) {
    if (dataTypes.value[key]) {
      dataTypes.value[key].count = data[key]
    }
  }

  triggerRef(dataTypes)
})

async function loadSpeciesCount() {
  const [speciesRes, generaRes, invalidRes] = await Promise.all([
    makeAPIRequest('/taxon_names.json', {
      params: {
        page: 1,
        per: 1,
        validity: true,
        descendants: true,
        'taxon_name_id[]': SYRPHIDAE_ID,
        rank: ['NomenclaturalRank::Iczn::SpeciesGroup::Species']
      }
    }),
    makeAPIRequest('/taxon_names.json', {
      params: {
        page: 1,
        per: 1,
        validity: true,
        descendants: true,
        'taxon_name_id[]': SYRPHIDAE_ID,
        rank: [
          'NomenclaturalRank::Iczn::GenusGroup::Genus',
          'NomenclaturalRank::Iczn::GenusGroup::Subgenus'
        ]
      }
    }),
    makeAPIRequest('/taxon_names.json', {
      params: {
        page: 1,
        per: 1,
        validity: false,
        descendants: true,
        'taxon_name_id[]': SYRPHIDAE_ID,
        rank: ['NomenclaturalRank::Iczn::SpeciesGroup::Species']
      }
    })
  ])

  dataTypes.value[TYPES.validSpecies].count = Number(speciesRes.headers['pagination-total'])
  dataTypes.value[TYPES.genera].count = Number(generaRes.headers['pagination-total'])
  dataTypes.value[TYPES.invalidSpecies].count = Number(invalidRes.headers['pagination-total'])

  triggerRef(dataTypes)
}

loadSpeciesCount()
</script>