<template>
  <div class="soi min-h-screen">
    <!-- Title -->
    <header class="border-b soi-rule">
      <div class="container mx-auto px-4 pt-12 pb-10 sm:pt-16 grid lg:grid-cols-12 gap-8 items-end">
        <div class="lg:col-span-7">
          <p class="soi-eyebrow">{{ t('eyebrow') }}</p>
          <h1 class="soi-serif mt-3 text-4xl sm:text-6xl font-semibold leading-[1.03] tracking-tight">
            {{ t('h1a') }}<br />
            <span class="italic font-normal">{{ t('h1b') }}</span>
          </h1>
        </div>
        <p class="lg:col-span-5 text-lg leading-relaxed soi-muted">
          {{ t('lede') }}
        </p>
      </div>
    </header>

    <!-- Story + aims -->
    <section class="container mx-auto px-4 py-14 sm:py-20 grid lg:grid-cols-12 gap-10 lg:gap-16">
      <div class="lg:col-span-7 space-y-5 text-[1.08rem] leading-[1.8]">
        <p class="soi-dropcap">
          {{ t('p1') }}
        </p>
        <p>
          {{ t('p2') }}
        </p>
      </div>

      <aside class="lg:col-span-5">
        <div class="soi-card p-6 sm:p-8">
          <p class="soi-eyebrow">{{ t('aimsTitle') }}</p>
          <ol class="mt-5 space-y-4">
            <li
              v-for="(aim, i) in aims"
              :key="aim"
              class="flex gap-4"
            >
              <span class="soi-serif italic text-xl soi-muted w-6 shrink-0">{{ i + 1 }}</span>
              <span class="leading-relaxed">{{ aim }}</span>
            </li>
          </ol>
        </div>
      </aside>
    </section>

    <!-- Team -->
    <section class="soi-team border-y soi-rule">
      <div class="container mx-auto px-4 py-14 sm:py-20">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p class="soi-eyebrow">{{ t('team') }}</p>
            <h2 class="soi-serif mt-3 text-3xl sm:text-[2.6rem] font-semibold leading-tight">{{ t('curators') }}</h2>
          </div>
        </div>

        <ul class="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <li
            v-for="c in curators"
            :key="c.name"
            class="soi-card p-6 flex gap-5 items-start"
          >
            <img
              v-if="c.image"
              :src="c.image"
              :alt="c.name"
              class="soi-portrait"
            />
            <span
              v-else
              class="soi-portrait soi-initials"
              aria-hidden="true"
              >{{ initials(c.name) }}</span
            >
            <div class="min-w-0">
              <h3 class="soi-serif text-xl font-semibold leading-tight">{{ c.name }}</h3>
              <p class="mt-1 text-sm font-semibold text-[color:var(--soi-yellow-deep)]">{{ c.role }}</p>
              <p class="mt-2 text-sm soi-muted leading-snug">{{ c.affiliation }}</p>
              <div class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <a
                  v-if="c.email"
                  :href="`mailto:${c.email}`"
                  class="soi-link"
                  >{{ t('email') }}</a
                >
                <a
                  v-if="c.url"
                  :href="c.url"
                  target="_blank"
                  rel="noopener"
                  class="soi-link"
                  >{{ t('profile') }}</a
                >
              </div>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <!-- Get involved -->
    <section class="container mx-auto px-4 py-14 sm:py-20">
      <div class="soi-involve grid lg:grid-cols-12 gap-8 items-center p-8 sm:p-12">
        <div class="lg:col-span-8">
          <h2 class="soi-serif text-3xl sm:text-4xl font-semibold leading-tight">{{ t('involved') }}</h2>
          <p class="mt-4 text-lg leading-relaxed max-w-2xl">
            {{ t('involvedText') }}
          </p>
        </div>
        <div class="lg:col-span-4 flex flex-wrap lg:justify-end gap-3">
          <a
            :href="`mailto:${contactEmail}?subject=Syrphidae%20of%20Italy`"
            class="soi-btn soi-btn-ink"
            >{{ t('write') }}</a
          >
          <RouterLink
            to="/help-wanted"
            class="soi-btn soi-btn-ghost"
            >{{ t('gaps') }}</RouterLink
          >
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useHead } from '@unhead/vue'
import curators from './components/Section/Data/curators.js'
import { useT } from '@/utils/soiLang.js'

const t = useT({
  en: {
    eyebrow: 'About',
    h1a: 'An open catalogue,',
    h1b: 'built by the people who study them',
    lede: 'Syrphidae of Italy (SoI) is a collaborative, open-access resource for the hoverflies (family Syrphidae) of Italy, maintained in TaxonWorks and published under CC BY.',
    p1: 'Hoverflies play crucial ecological roles as pollinators, aphid predators and bioindicators, yet their diversity and distribution in Italy remain poorly documented. SoI was created to close those gaps: to centralise what is known, make it easy to use, and invite new contributions.',
    p2: 'We gather data from field observations, museum collections, taxonomic literature and citizen science, and link every record to its source. The result is a living resource that grows as new names, records and images are added.',
    aimsTitle: 'What SoI brings together',
    a1: 'Taxonomic and distributional data for every Italian hoverfly',
    a2: 'High-quality images and identification keys',
    a3: 'Ecological and behavioural information',
    a4: 'Curated literature and links to other resources',
    team: 'The team',
    curators: 'Curators & contributors',
    email: 'Email',
    profile: 'Profile',
    involved: 'Get involved',
    involvedText: 'Specialists, naturalists, students and citizen scientists are all welcome. Share records, photographs, literature or expertise — or tell us what is missing.',
    write: 'Write to the curators',
    gaps: 'See what’s missing'
  },
  it: {
    eyebrow: 'Chi siamo',
    h1a: 'Un catalogo aperto,',
    h1b: 'costruito da chi li studia',
    lede: 'Syrphidae of Italy (SoI) è una risorsa collaborativa e ad accesso aperto sui sirfidi (famiglia Syrphidae) d’Italia, gestita in TaxonWorks e pubblicata con licenza CC BY.',
    p1: 'I sirfidi svolgono ruoli ecologici fondamentali come impollinatori, predatori di afidi e bioindicatori, ma la loro diversità e distribuzione in Italia restano poco documentate. SoI è nato per colmare queste lacune: riunire ciò che si sa, renderlo facile da usare e invitare nuovi contributi.',
    p2: 'Raccogliamo dati da osservazioni sul campo, collezioni museali, letteratura tassonomica e citizen science, collegando ogni record alla sua fonte. Il risultato è una risorsa viva, che cresce con ogni nuovo nome, record e immagine.',
    aimsTitle: 'Cosa riunisce SoI',
    a1: 'Dati tassonomici e distributivi per ogni sirfide italiano',
    a2: 'Immagini di qualità e chiavi di identificazione',
    a3: 'Informazioni ecologiche e comportamentali',
    a4: 'Letteratura selezionata e collegamenti ad altre risorse',
    team: 'Il gruppo',
    curators: 'Curatori e collaboratori',
    email: 'Email',
    profile: 'Profilo',
    involved: 'Partecipa',
    involvedText: 'Specialisti, naturalisti, studenti e citizen scientist sono i benvenuti. Condividi record, fotografie, letteratura o competenze — o segnalaci cosa manca.',
    write: 'Scrivi ai curatori',
    gaps: 'Guarda cosa manca'
  }
})

useHead({
  title: () => `${t('eyebrow')} — Syrphidae of Italy`,
  meta: [{ name: 'description', content: () => t('lede') }]
})

const aims = computed(() => [t('a1'), t('a2'), t('a3'), t('a4')])

const contactEmail = curators.find((c) => c.email)?.email || ''

function initials(name = '') {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
}
</script>

<style scoped>
.soi-team {
  background: var(--soi-paper-2);
}
.soi-portrait {
  width: 5.5rem;
  height: 5.5rem;
  flex-shrink: 0;
  border-radius: 999px;
  object-fit: cover;
  box-shadow: 0 0 0 3px var(--soi-card), 0 0 0 5px var(--soi-yellow);
}
.soi-initials {
  display: grid;
  place-items: center;
  background: var(--soi-paper-2);
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.6rem;
  font-weight: 600;
}
.soi-dropcap::first-letter {
  float: left;
  font-family: 'Fraunces', Georgia, serif;
  font-size: 4.1em;
  line-height: 0.85;
  font-weight: 600;
  padding: 0.08em 0.12em 0 0;
  color: var(--soi-yellow-deep);
}
.soi-involve {
  background: var(--soi-ink);
  color: var(--soi-paper);
  border-radius: 6px;
  background-image: linear-gradient(90deg, var(--soi-ink) 70%, transparent),
    repeating-linear-gradient(135deg, var(--soi-yellow) 0 14px, var(--soi-ink) 14px 22px);
}
.soi-involve .soi-btn-ink {
  background: var(--soi-yellow);
  color: #22281c;
}
.soi-involve .soi-btn-ink:hover {
  background: var(--soi-paper);
}
.soi-btn-ghost {
  border: 1px solid color-mix(in srgb, var(--soi-paper) 50%, transparent);
  color: var(--soi-paper);
}
.soi-btn-ghost:hover {
  background: color-mix(in srgb, var(--soi-paper) 12%, transparent);
}
</style>
