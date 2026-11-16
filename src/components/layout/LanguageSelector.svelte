<script lang="ts">
  import { getLocale, locales, setLocale } from '@/paraglide/runtime.js';
  import { m } from '@/paraglide/messages.js';

  const localeNames: Record<(typeof locales)[number], string> = {
    en: 'English',
    de: 'Deutsch',
    fr: 'Français',
    es: 'Español',
    ja: '日本語',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    pt_BR: 'Português (Brasil)',
    ru: 'Русский',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    zh_CN: '简体中文',
  };
  const selectedLocale = getLocale();
  document.documentElement.lang = selectedLocale;

  function changeLocale(event: Event) {
    const locale = (event.currentTarget as HTMLSelectElement).value as (typeof locales)[number];
    void setLocale(locale);
  }
</script>

<div class="flex items-center justify-center gap-2">
  <label class="text-sm font-medium" for="language-selector">
    {m['common.language.label']()}
  </label>
  <select
    id="language-selector"
    class="select select-bordered select-sm w-auto"
    value={selectedLocale}
    onchange={changeLocale}
  >
    {#each locales as locale (locale)}
      <option value={locale}>{localeNames[locale]}</option>
    {/each}
  </select>
</div>
