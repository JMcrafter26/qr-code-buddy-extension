<script lang="ts">
  import { getLocale, locales, setLocale } from '@/paraglide/runtime.js';
  import { m } from '@/paraglide/messages.js';

  const localeNames: Record<(typeof locales)[number], string> = {
    en: 'English',
    de: 'Deutsch',
  };
  const selectedLocale = getLocale();
  document.documentElement.lang = selectedLocale;

  function changeLocale(event: Event) {
    const locale = (event.currentTarget as HTMLSelectElement).value as (typeof locales)[number];
    void setLocale(locale);
  }
</script>

<div class="flex items-center justify-between gap-3">
  <label class="text-sm font-medium" for="language-selector">
    {m['common.language.label']()}
  </label>
  <select
    id="language-selector"
    class="select select-bordered select-sm"
    value={selectedLocale}
    onchange={changeLocale}
  >
    {#each locales as locale (locale)}
      <option value={locale}>{localeNames[locale]}</option>
    {/each}
  </select>
</div>
