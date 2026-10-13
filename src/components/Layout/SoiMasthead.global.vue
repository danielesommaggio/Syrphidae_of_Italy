<template>
  <header class="soi-masthead">
    <div class="container mx-auto box-border px-4 pt-10 pb-8 sm:pt-14">
      <p
        v-if="eyebrow"
        class="soi-eyebrow"
      >
        {{ eyebrow }}
      </p>
      <div class="mt-3 grid lg:grid-cols-12 gap-4 lg:gap-10 items-end">
        <h1 class="lg:col-span-7 soi-serif text-4xl sm:text-5xl font-semibold leading-[1.05] tracking-tight">
          {{ title }}
        </h1>
        <p
          v-if="lede || $slots.default"
          class="lg:col-span-5 text-lg leading-relaxed soi-muted"
        >
          <slot>{{ lede }}</slot>
        </p>
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  lede: { type: String, default: '' }
})
</script>

<style scoped>
.soi-masthead {
  background: var(--soi-paper);
  color: var(--soi-ink);
  border-bottom: 1px solid var(--soi-rule);
}
</style>
