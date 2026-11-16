<script lang="ts">
  import { i18n } from '#i18n';

  const availableLocales = [
    { code: 'en', name: 'English' },
    { code: 'de', name: 'Deutsch' },
  ] as const;
  const browserLocale = browser.i18n.getUILanguage().toLowerCase().split('-')[0];
  const selectedLocale = availableLocales.some(({ code }) => code === browserLocale)
    ? browserLocale
    : availableLocales[0].code;
</script>

<div class="flex items-center justify-between gap-3">
  <label class="text-sm font-medium" for="language-selector">
    {i18n.t('common.language.label')}
  </label>
  <select
    id="language-selector"
    class="select select-bordered select-sm"
    value={selectedLocale}
    disabled
    aria-describedby="language-selector-help"
  >
    {#each availableLocales as locale (locale.code)}
      <option value={locale.code}>{locale.name}</option>
    {/each}
  </select>
</div>
<p id="language-selector-help" class="mt-1 text-xs text-base-content/60">
  {i18n.t('common.language.browserControlled')}
</p>
