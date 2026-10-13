<template>
  <section class="soi-hero relative overflow-x-clip">
    <div class="container mx-auto px-4 pt-10 pb-12 sm:pt-16 sm:pb-16 grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
      <!-- Text column -->
      <div class="lg:col-span-7 relative z-20">
        <p class="soi-eyebrow">Diptera · Syrphidae · Italia</p>

        <h1 class="soi-serif mt-4 text-[2.6rem] leading-[1.02] sm:text-6xl lg:text-[4.4rem] font-semibold tracking-tight">
          Syrphidae
          <span class="block italic font-normal text-[0.82em]">
            {{ t('ofItaly') }}
            <span class="soi-hero-tag not-italic align-middle">SoI</span>
          </span>
        </h1>

        <p class="mt-6 text-lg sm:text-xl leading-relaxed soi-muted max-w-xl">
          {{ t('lead1') }}
          <strong class="text-[color:var(--soi-ink)] font-semibold">
            <span :class="{ 'soi-skel': species === null }">{{ fmt(species) }}</span> {{ t('species') }}
          </strong>
          {{ t('lead2') }}
        </p>

        <div class="mt-8 max-w-xl">
          <label
            for="soi-hero-search"
            class="sr-only"
            >{{ t('searchLabel') }}</label
          >
          <div class="soi-search">
            <AutocompleteOtu
              id="soi-hero-search"
              class="w-full"
              :placeholder="t('placeholder')"
            />
          </div>
          <div class="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <span class="soi-muted">{{ t('orStart') }}</span>
            <RouterLink
              to="/taxa"
              class="soi-link font-semibold"
              >{{ t('linkGenera') }}</RouterLink
            >
            <RouterLink
              to="/atlas"
              class="soi-link font-semibold"
              >{{ t('linkAtlas') }}</RouterLink
            >
            <RouterLink
              to="/keys"
              class="soi-link font-semibold"
              >{{ t('linkKeys') }}</RouterLink
            >
          </div>
        </div>
      </div>

      <!-- Plate column -->
      <div class="lg:col-span-5 relative z-10 mx-auto w-full max-w-md lg:max-w-none">
        <figure class="soi-plate rotate-[1.2deg]">
          <div class="relative aspect-[4/3] overflow-hidden soi-plate-frame">
            <Transition name="soi-fade">
              <component
                :is="plate.otuId ? 'RouterLink' : 'div'"
                :key="plate.src"
                :to="plate.otuId ? { name: 'otus-id-overview', params: { id: plate.otuId } } : undefined"
                class="absolute inset-0 block"
              >
                <img
                  :src="plate.src"
                  :alt="plate.alt"
                  class="w-full h-full transition-transform duration-700 hover:scale-[1.03]"
                  :class="plate.specimen ? 'object-contain p-3' : 'object-cover'"
                />
              </component>
            </Transition>
          </div>
          <figcaption class="flex items-baseline justify-between gap-3 px-1 py-3 text-sm">
            <span class="min-w-0 truncate">
              <span class="soi-eyebrow !tracking-[0.15em] mr-2">{{ t('plate') }} {{ roman(index + 1) }}</span>
              <component
                :is="plate.otuId ? 'RouterLink' : 'span'"
                :to="plate.otuId ? { name: 'otus-id-overview', params: { id: plate.otuId } } : undefined"
                class="soi-serif italic text-base hover:underline"
                >{{ plate.name }}</component
              >
            </span>
            <span class="soi-muted text-xs shrink-0">{{ plate.credit }}</span>
          </figcaption>
        </figure>

        <div
          v-if="plates.length > 1"
          class="mt-4 flex justify-center gap-2"
          role="group"
          :aria-label="t('plates')"
        >
          <button
            v-for="(p, i) in plates"
            :key="p.src"
            type="button"
            class="soi-dot"
            :class="{ on: i === index }"
            :aria-label="`${t('plate')} ${roman(i + 1)}: ${p.name}`"
            :aria-pressed="i === index"
            @click="go(i)"
          />
        </div>
        <span
          class="soi-hero-dot"
          aria-hidden="true"
        />
      </div>
    </div>
    <div class="soi-stripe" />
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import scaeva from '../images/scaeva.jpg'
import { fmt, useSoiStats } from './useSoiStats.js'
import { useSoiImages } from './useSoiImages.js'
import { useT } from '@/utils/soiLang.js'

const t = useT({
  en: {
    ofItaly: 'of Italy',
    lead1: 'The reference catalogue of Italian hoverflies — names, synonyms, literature, specimen records and identification keys for',
    species: 'species',
    lead2: 'from the peninsula and its islands.',
    searchLabel: 'Search a hoverfly name',
    placeholder: 'Search a genus or species, e.g. Eristalis tenax',
    orStart: 'Or start from',
    linkGenera: 'the genera table',
    linkAtlas: 'the atlas',
    linkKeys: 'identification keys',
    plate: 'Plate',
    plates: 'Plates',
    onThistle: 'photographed on a thistle flower',
    specimen: 'museum specimen, dorsal view'
  },
  it: {
    ofItaly: 'd’Italia',
    lead1: 'Il catalogo di riferimento dei sirfidi italiani — nomi, sinonimi, letteratura, record di esemplari e chiavi di identificazione per',
    species: 'specie',
    lead2: 'della penisola e delle isole.',
    searchLabel: 'Cerca il nome di un sirfide',
    placeholder: 'Cerca un genere o una specie, es. Eristalis tenax',
    orStart: 'Oppure parti da',
    linkGenera: 'la tabella dei generi',
    linkAtlas: 'l’atlante',
    linkKeys: 'le chiavi di identificazione',
    plate: 'Tavola',
    plates: 'Tavole',
    onThistle: 'fotografato su un fiore di cardo',
    specimen: 'esemplare museale, vista dorsale'
  }
})

const stats = useSoiStats()
const images = useSoiImages()
const species = computed(() => stats.family.species)

const plates = computed(() => [
  {
    name: 'Scaeva',
    credit: '© Serena Magagnoli',
    src: scaeva,
    otuId: 950165,
    specimen: false,
    alt: `Scaeva, ${t('onThistle')}`
  },
  ...images.plates.map((p) => ({ ...p, alt: `${p.name}, ${t('specimen')}` }))
])

const index = ref(0)
const plate = computed(() => plates.value[index.value] || plates.value[0])

function go(i) {
  index.value = i
  restart()
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']
const roman = (n) => ROMAN[n - 1] || String(n)

let timer = null
function restart() {
  clearInterval(timer)
  if (typeof window === 'undefined') return
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
  timer = setInterval(() => {
    if (plates.value.length > 1) index.value = (index.value + 1) % plates.value.length
  }, 7000)
}

onMounted(restart)
onBeforeUnmount(() => clearInterval(timer))
</script>

<style scoped>
.soi-hero {
  background:
    radial-gradient(circle at 85% 20%, color-mix(in srgb, var(--soi-yellow) 22%, transparent) 0, transparent 38%),
    var(--soi-paper);
}
.soi-plate-frame {
  background: #f7f5ef;
}
.soi-hero-tag {
  display: inline-block;
  margin-left: 0.4rem;
  padding: 0.1rem 0.55rem 0.15rem;
  font-family: 'Source Sans 3', system-ui, sans-serif;
  font-size: 0.32em;
  font-weight: 700;
  letter-spacing: 0.15em;
  background: var(--soi-yellow);
  color: #22281c;
  border-radius: 3px;
  transform: translateY(-0.35em);
}
.soi-hero-dot {
  position: absolute;
  right: -1.5rem;
  bottom: 1rem;
  width: 7rem;
  height: 7rem;
  border-radius: 999px;
  background: repeating-linear-gradient(135deg, var(--soi-yellow) 0 9px, var(--soi-ink) 9px 13px);
  opacity: 0.85;
  z-index: -1;
}
.soi-dot {
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 999px;
  background: var(--soi-rule);
  transition: background 0.2s, transform 0.2s;
}
.soi-dot.on {
  background: var(--soi-ink);
  transform: scale(1.25);
}
.soi-fade-enter-active,
.soi-fade-leave-active {
  transition: opacity 0.9s ease;
}
.soi-fade-enter-from,
.soi-fade-leave-to {
  opacity: 0;
}
@media (max-width: 640px) {
  .soi-hero-dot {
    width: 4.5rem;
    height: 4.5rem;
    right: -0.5rem;
    bottom: 1.5rem;
  }
}
</style>
