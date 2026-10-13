<template>
  <section
    v-if="images.gallery.length || !images.loaded"
    class="soi-gallery"
  >
    <div class="container mx-auto px-4 py-14 sm:py-20">
      <div class="grid lg:grid-cols-12 gap-6 items-end mb-10">
        <div class="lg:col-span-7">
          <p class="soi-eyebrow">{{ t('eyebrow') }}</p>
          <h2 class="soi-serif mt-3 text-3xl sm:text-[2.6rem] leading-tight font-semibold">{{ t('title') }}</h2>
        </div>
        <p class="lg:col-span-5 soi-muted text-base sm:text-lg leading-relaxed">{{ t('lede') }}</p>
      </div>

      <ul class="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
        <template v-if="!images.loaded">
          <li
            v-for="n in 8"
            :key="n"
            class="soi-skel block aspect-square w-full"
          />
        </template>
        <li
          v-for="img in images.gallery"
          :key="img.id"
        >
          <RouterLink
            :to="{ name: 'otus-id-overview', params: { id: img.otuId } }"
            class="group block soi-card overflow-hidden !text-[color:var(--soi-ink)]"
            :title="img.credit"
          >
            <div class="aspect-square overflow-hidden bg-[#f4f2ec]">
              <img
                :src="img.src"
                :alt="`${img.part ? img.part[lang] + ' — ' : ''}${plain(img.html)}`"
                loading="lazy"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div class="px-3 py-2.5">
              <p
                v-if="img.part"
                class="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[color:var(--soi-yellow-deep)]"
              >
                {{ img.part[lang] || img.part.en }}
              </p>
              <p
                class="soi-gal-name text-sm leading-snug truncate group-hover:underline underline-offset-2"
                v-html="img.html"
              />
            </div>
          </RouterLink>
        </li>
      </ul>
      <p class="mt-4 text-xs soi-muted">{{ t('credit') }}</p>
    </div>
  </section>
</template>

<script setup>
import { useSoiImages } from './useSoiImages.js'
import { lang, useT } from '@/utils/soiLang.js'

const images = useSoiImages()

const t = useT({
  en: {
    eyebrow: 'Under the microscope',
    title: 'Characters that tell them apart',
    lede: 'Close-ups of the features used in the SoI keys. Each opens the species page.',
    credit: 'Photographs from the SoI image collection — credits and licences are shown on each species page.'
  },
  it: {
    eyebrow: 'Al microscopio',
    title: 'I caratteri che le distinguono',
    lede: 'Dettagli dei caratteri usati nelle chiavi di SoI. Ogni foto apre la pagina della specie.',
    credit: 'Foto dalla collezione di immagini di SoI — autori e licenze sono indicati nella pagina di ogni specie.'
  }
})

const plain = (html = '') => html.replace(/<[^>]*>/g, '')
</script>

<style scoped>
.soi-gallery {
  background: var(--soi-paper);
}
.soi-gal-name :deep(i) {
  font-style: italic;
}
</style>
