<template>
  <section class="soi-about border-y soi-rule">
    <div class="container mx-auto px-4 py-14 sm:py-20 grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
      <div class="lg:col-span-5 order-2 lg:order-1">
        <div class="soi-about-disc mx-auto">
          <img
            src="/images/Syrphidae.png"
            :alt="t('mapAlt')"
            class="soi-about-fly"
            width="1536"
            height="1024"
          />
        </div>
      </div>

      <div class="lg:col-span-7 order-1 lg:order-2">
        <p class="soi-eyebrow">{{ t('eyebrow') }}</p>
        <h2 class="soi-serif mt-3 text-3xl sm:text-[2.6rem] leading-tight font-semibold">
          {{ t('title') }}
        </h2>
        <p class="mt-5 text-lg leading-relaxed soi-muted">
          {{ t('p1') }}
          <a
            href="https://taxonworks.org"
            target="_blank"
            rel="noopener"
            class="soi-link"
            >TaxonWorks</a
          >{{ t('p2') }}
        </p>

        <ul class="mt-8 grid sm:grid-cols-3 gap-6">
          <li
            v-for="r in roles"
            :key="r.title"
            class="border-t-2 pt-4"
            :style="{ borderColor: r.color }"
          >
            <h3 class="soi-serif text-xl font-semibold">{{ r.title }}</h3>
            <p class="mt-2 text-[0.95rem] leading-relaxed soi-muted">{{ r.text }}</p>
          </li>
        </ul>

        <div class="mt-9 flex flex-wrap gap-3">
          <RouterLink
            to="/about"
            class="soi-btn soi-btn-ink"
            >{{ t('btnAbout') }}</RouterLink
          >
          <RouterLink
            to="/atlas"
            class="soi-btn soi-btn-line"
            >{{ t('btnAtlas') }}</RouterLink
          >
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useT } from '@/utils/soiLang.js'

const t = useT({
  en: {
    mapAlt: 'Drawing of a hoverfly, dorsal view — the SoI emblem',
    eyebrow: 'The project',
    title: 'Why a catalogue of Italian hoverflies?',
    p1: 'Italy spans Alpine, continental and Mediterranean climates and is one of Europe’s richest countries for hoverflies — yet records are scattered across more than two centuries of literature and dozens of collections. SoI brings them together in',
    p2: ': every name, synonym, citation and specimen, linked and open.',
    btnAbout: 'About SoI and the team',
    btnAtlas: 'Explore the atlas',
    r1: 'Pollinators',
    r1t: 'Adults visit a wide range of wild and crop flowers — among the most important pollinators after bees.',
    r2: 'Pest control',
    r2t: 'Larvae of many species eat aphids, making them natural allies in farms and gardens.',
    r3: 'Bioindicators',
    r3t: 'Their varied larval habits make hoverfly communities a sensitive measure of habitat quality.'
  },
  it: {
    mapAlt: 'Disegno di un sirfide in vista dorsale — l’emblema di SoI',
    eyebrow: 'Il progetto',
    title: 'Perché un catalogo dei sirfidi italiani?',
    p1: 'L’Italia comprende climi alpini, continentali e mediterranei ed è uno dei Paesi europei più ricchi di sirfidi — ma i dati sono dispersi in oltre due secoli di letteratura e in decine di collezioni. SoI li riunisce in',
    p2: ': ogni nome, sinonimo, citazione ed esemplare, collegati e aperti.',
    btnAbout: 'Il progetto e il gruppo',
    btnAtlas: 'Esplora l’atlante',
    r1: 'Impollinatori',
    r1t: 'Gli adulti visitano un’ampia varietà di fiori spontanei e coltivati — tra gli impollinatori più importanti dopo le api.',
    r2: 'Controllo biologico',
    r2t: 'Le larve di molte specie si nutrono di afidi: alleate naturali in campi e giardini.',
    r3: 'Bioindicatori',
    r3t: 'La varietà delle abitudini larvali rende le comunità di sirfidi un indicatore sensibile della qualità degli habitat.'
  }
})

const roles = computed(() => [
  { title: t('r1'), text: t('r1t'), color: 'var(--soi-yellow)' },
  { title: t('r2'), text: t('r2t'), color: 'var(--soi-olive)' },
  { title: t('r3'), text: t('r3t'), color: 'var(--soi-terra)' }
])
</script>

<style scoped>
.soi-about {
  background: var(--soi-paper);
}
.soi-about-disc {
  position: relative;
  max-width: 460px;
}
.soi-about-fly {
  position: relative;
  width: 100%;
  height: auto;
  filter: drop-shadow(0 18px 22px rgba(34, 40, 28, 0.22));
}
</style>
