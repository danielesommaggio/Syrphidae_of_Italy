<template>
  <div
    ref="root"
    class="relative key-print-hide"
  >
    <button
      type="button"
      class="inline-flex items-center gap-1.5 rounded-md border px-3 py-1 text-sm font-medium transition-colors border-[#c9c7bf] text-[#44443f] hover:border-[#44443f]"
      :aria-expanded="open"
      @click="open = !open"
    >
      <svg
        viewBox="0 0 24 24"
        class="h-4 w-4"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        aria-hidden="true"
      ><path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1h-2M6 14h12v7H6z" /></svg>
      {{ t('print') }}
    </button>
    <div
      v-if="open"
      class="absolute right-0 z-50 mt-1 w-64 rounded-md border border-base-muted bg-base-foreground p-3 text-sm shadow-lg"
    >
      <p class="text-base-soft leading-snug">
        {{ t('help') }}
      </p>
      <label class="mt-2 flex items-center gap-2">
        <input
          v-model="figures"
          type="checkbox"
        />
        {{ t('figures') }}
      </label>
      <button
        type="button"
        class="mt-3 w-full rounded-md bg-[#44443f] px-3 py-1.5 font-semibold text-white hover:bg-[#5f5e5a] disabled:opacity-60"
        :disabled="busy"
        @click="go"
      >
        {{ busy ? t('preparing') : t('go') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useT } from '@/utils/soiLang.js'

// "Print / PDF": a small menu (include figures?) → emits `print` with the options;
// KeyView switches to the full key, waits for the figures and opens the print dialog,
// where "Save as PDF" makes the PDF.
const props = defineProps({ busy: { type: Boolean, default: false } })
const emit = defineEmits(['print'])

const t = useT({
  en: {
    print: 'Print / PDF',
    help: 'Prints the full key with page numbers and the citation. To get a PDF, choose “Save as PDF” in the print dialog.',
    figures: 'Include the figures',
    go: 'Print',
    preparing: 'Preparing…'
  },
  it: {
    print: 'Stampa / PDF',
    help: 'Stampa la chiave completa con i numeri di pagina e la citazione. Per un PDF, scegli “Salva come PDF” nella finestra di stampa.',
    figures: 'Includi le figure',
    go: 'Stampa',
    preparing: 'Preparazione…'
  }
})

const open = ref(false)
const figures = ref(true)
const root = ref(null)

function go() {
  emit('print', { figures: figures.value })
  open.value = false
}
const outside = (e) => { if (open.value && root.value && !root.value.contains(e.target)) open.value = false }
onMounted(() => document.addEventListener('click', outside))
onBeforeUnmount(() => document.removeEventListener('click', outside))
</script>
