<template>
  <section>
    <div class="container max-w-screen-xl mx-auto py-10">
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
                  :to="{ name: 'taxa-name', params: { name: item.taxonName } }"
                  style="text-decoration: none;"
                  >
                  <span v-html="item.taxonName"></span>
                  </RouterLink>
                  <span style="font-size: 0.85em; color: #666; margin-left: 4px;">
                    {{ item.author }}
                  </span>
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
import taxaList from './constants/taxa.js';
</script>
