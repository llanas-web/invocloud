<script setup lang="ts">
  import { parseAmountFR, formatAmountLocale } from '~/utils/number';

  // Props
  const props = withDefaults(defineProps<{
    /** Locale pour le formatage à l’affichage (blur) */
    locale?: string
    /** Nombre de décimales formatées au blur */
    fractionDigits?: number
    /** Autoriser les montants négatifs (par défaut non) */
    allowNegative?: boolean
    /** Formater automatiquement au blur (true) */
    formatOnBlur?: boolean
    /** Placeholder à passer au UInput */
    placeholder?: string
  }>(), {
    locale: 'fr-FR',
    fractionDigits: 2,
    allowNegative: false,
    formatOnBlur: true,
    placeholder: '1 234,56',
  })

  // v-model (string) pour coller exactement ce que l’utilisateur tape / colle.
  // La validation Zod convertira en Number au submit.
  const model = defineModel<string | number>({ default: '' })

  // Nettoyage léger à l’input: on laisse l’utilisateur taper, on filtre seulement les caractères très exotiques.
  // On autorise chiffres, espaces (y compris fines/NBSP), ., , , €, et - (optionnel).
  function sanitizeTyping(raw: string): string {
    const allowed = props.allowNegative ? /[0-9.,€\-\s\u00A0\u202F']/g : /[0-9.,€\s\u00A0\u202F']/g
    const kept = raw.match(allowed)?.join('') ?? ''
    return kept
  }

  function onInput(e: Event) {
    const el = e.target as HTMLInputElement
    // On garde la valeur telle quelle mais avec un nettoyage minimal
    const next = sanitizeTyping(el.value)
    model.value = next
  }

  function onPaste(e: ClipboardEvent) {
    const text = e.clipboardData?.getData('text') ?? ''
    // On empêche le collage brut, on insère la version nettoyée
    e.preventDefault()
    const cleaned = sanitizeTyping(text)
    // Insère au caret
    const target = e.target as HTMLInputElement
    const selectionStart: number = typeof target.selectionStart === 'number' ? target.selectionStart : target.value.length
    const selectionEnd: number = typeof target.selectionEnd === 'number' ? target.selectionEnd : selectionStart
    const newVal = target.value.slice(0, selectionStart) + cleaned + target.value.slice(selectionEnd)
    model.value = newVal
    // Repositionner le caret au mieux (optionnel)
    requestAnimationFrame(() => {
      const pos = selectionStart + cleaned.length
      target.setSelectionRange(pos, pos)
    })
  }

  function onBlur() {
    if (!props.formatOnBlur) return
    const n = parseAmountFR(model.value)
    if (!Number.isFinite(n)) return
    if (!props.allowNegative && n < 0) {
      // Si négatif non autorisé, on remet en positif (ou on pourrait laisser tel quel)
      model.value = formatAmountLocale(Math.abs(n), props.locale, props.fractionDigits)
    } else {
      model.value = formatAmountLocale(n, props.locale, props.fractionDigits)
    }
  }
</script>

<template>
  <!-- Passe tout le reste aux attrs pour permettre icon, size, disabled, etc. -->
  <UInput :model-value="model" @update:model-value="val => model = String(val ?? '')" type="text" inputmode="decimal"
    autocomplete="off" spellcheck="false" :placeholder="placeholder" @input="onInput" @paste="onPaste" @blur="onBlur"
    v-bind="$attrs" />
</template>
