<template>
  <section class="bg-base-foreground py-10 px-4">
    <div class="container mx-auto max-w-4xl">

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <!-- Citation -->
        <div class="sm:col-span-2 flex flex-col gap-3 border border-base-muted rounded-2xl p-6 bg-base-secondary">
          <span class="text-xs tracking-[0.25em] uppercase text-base-soft">How to cite</span>
          <h2 class="text-lg font-medium text-base-content tracking-tight">
            Referencing this website
          </h2>
          <p class="text-sm leading-relaxed text-base-soft">
            When referencing this website, please use our published data paper:
            Sommaggio, D. &amp; Dal Pos, D. (2024). <em>Syrphidae of Italy (SoI): a comprehensive
            database for the Italian fauna of Hoverflies.</em> Nature, XX: XXX–XXX.
            [retrieval date].
          </p>
          
          <a  :href="project_url"
            class="text-sm text-base-content underline underline-offset-2 hover:opacity-70 transition-opacity break-all"
          >
            {{ project_url }}
          </a>
        </div>

        <!-- Find out more -->
        <div class="flex flex-col gap-3 border border-base-muted rounded-2xl p-6 bg-base-secondary justify-between">
          <div class="flex flex-col gap-3">
            <span class="text-xs tracking-[0.25em] uppercase text-base-soft">Collaborate</span>
            <h2 class="text-lg font-medium text-base-content tracking-tight">
              Find out more
            </h2>
            <p class="text-sm leading-relaxed text-base-soft">
              Learn how to collaborate with <strong class="text-base-content font-medium">Syrphidae of Italy</strong>.
              Contact information, technical details, and more.
            </p>
          </div>
          <RouterLink
            to="about"
            class="inline-flex items-center gap-2 text-sm font-medium text-base-content border border-base-muted rounded-lg px-4 py-2 hover:bg-base-muted transition-colors self-start mt-2"
          >
            <i class="ti ti-arrow-right" style="font-size: 15px;" aria-hidden="true"></i>
            About page
          </RouterLink>
        </div>

        <!-- Terms of use -->
        <div class="sm:col-span-3 flex flex-col gap-3 border border-base-muted rounded-2xl p-6 bg-base-secondary">
          <span class="text-xs tracking-[0.25em] uppercase text-base-soft">Legal</span>
          <h2 class="text-lg font-medium text-base-content tracking-tight">
            Terms of use
          </h2>
          <p class="text-sm leading-relaxed text-base-soft">
            Except where otherwise noted, content on this site is licensed under the
            
            <a  href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              class="text-base-content underline underline-offset-2 hover:opacity-70 transition-colors"
            >Creative Commons Attribution License (CC-BY)</a>.
            Images are by default open-access under the terms of the
            
             <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              class="text-base-content underline underline-offset-2 hover:opacity-70 transition-colors"
            >CC BY-NC-SA license</a>,
            unless stated otherwise.
          </p>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup>
const { project_url } = __APP_ENV__
</script>