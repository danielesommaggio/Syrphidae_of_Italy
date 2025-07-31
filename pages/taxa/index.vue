<template>
  <section>
    <div class="container mx-auto py-10">
      <VCard>
        <VCardContent>
          <VTable>
            <VTableHeader>
              <VTableHeaderRow>
                <VTableHeaderCell>Genus name</VTableHeaderCell>
              </VTableHeaderRow>
            </VTableHeader>
            <VTableBody>
              <VTableBodyRow
                v-for="item in taxaList"
                :key="item.id"
              >
                <VTableBodyCell>
                  <RouterLink
                    :to="{
                      name: 'taxa-name',
                      params: { name: item.taxonName }
                    }"
                    v-html="item.taxonName"
                  />
                </VTableBodyCell>
              </VTableBodyRow>
            </VTableBody>
          </VTable>
        </VCardContent>
      </VCard>
    </div>
  </section>
</template>

<script setup>
import taxaList from './constants/taxa.js'
</script>
