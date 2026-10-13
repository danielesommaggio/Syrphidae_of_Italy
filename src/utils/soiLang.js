// Tiny EN/IT switch for the Syrphidae of Italy pages.
// The choice is remembered in the browser; English is the default.
import { computed, ref } from 'vue'

const STORAGE_KEY = 'soi-lang'
const SUPPORTED = ['en', 'it']

function initial() {
  if (import.meta.env.SSR) return 'en'
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (SUPPORTED.includes(saved)) return saved
  } catch {
    // storage blocked: fall through
  }
  return 'en'
}

export const lang = ref(initial())

if (!import.meta.env.SSR) {
  document.documentElement.lang = lang.value
}

export function setLang(value) {
  if (!SUPPORTED.includes(value)) return
  lang.value = value
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch {
    // ignore
  }
  if (!import.meta.env.SSR) document.documentElement.lang = value
}

/**
 * Returns a translator bound to a component's own dictionary:
 *   const t = useT({ en: { hello: 'Hello' }, it: { hello: 'Ciao' } })
 *   t('hello')            -> 'Hello' / 'Ciao'
 *   t('count', { n: 3 })  -> replaces {n}
 */
export function useT(dict) {
  return (key, vars) => {
    let s = dict[lang.value]?.[key] ?? dict.en?.[key] ?? key
    if (vars) for (const k in vars) s = s.replaceAll(`{${k}}`, vars[k])
    return s
  }
}

export const isIt = computed(() => lang.value === 'it')

// Header / footer labels from config/header.yml
const MENU_IT = {
  Home: 'Home',
  Genera: 'Generi',
  Keys: 'Chiavi',
  Atlas: 'Atlante',
  Bibliography: 'Bibliografia',
  Data: 'Dati',
  Latest: 'Novità',
  'Names added': 'Nomi aggiunti',
  'References added': 'Riferimenti aggiunti',
  'Help wanted': 'Cerchiamo aiuto',
  News: 'Notizie',
  About: 'Progetto',
  'About SoI': 'Chi siamo'
}

export function menuLabel(label) {
  return lang.value === 'it' ? MENU_IT[label] || label : label
}
