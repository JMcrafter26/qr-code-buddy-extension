# Contributing to QR Code Buddy

Thank you for helping improve QR Code Buddy.
Contributions should keep the extension privacy-focused, easy to maintain, and compatible with the supported browsers.

## Before you start

1. Check existing issues and pull requests before starting substantial work.
2. For larger changes, open an issue first so the proposed behavior can be discussed.
3. Keep pull requests focused. Avoid mixing refactors or formatting changes with unrelated fixes.

## Development setup

Requirements:

- Node.js
- pnpm

Install dependencies from the repository root:

```bash
pnpm install
```

Run post-install scripts to generate Paraglide and manifest locale files:

```bashbash
pnpm postinstall
```

Start a browser-specific development build:

```bash
pnpm dev:chrome
pnpm dev:firefox
pnpm dev:edge
```

WXT writes development output to `.output/`. Load the generated extension
directory using your browser's extension developer tools.

## Useful commands

```bash
# Type-check Svelte and generated Paraglide code
pnpm check

# Check translations and message usage
pnpm check:i18n
pnpm lint:i18n

# Run ESLint and formatting checks (highly recommended before submitting a pull request)
pnpm lint
pnpm format

# Build Chrome and Firefox production bundles
pnpm build

# Create publishable archives
pnpm zip
```

Run the relevant checks before opening a pull request. Changes to entrypoints,
components, storage, or build configuration should normally be checked with
`pnpm check` and a browser build.

## Project structure

- `src/entrypoints/` contains popup, welcome, options, QR, and background
  entrypoints.
- `src/components/` contains reusable Svelte components.
- `src/utils/` contains storage, QR, URL, browser, and other application logic.
- `src/locales/` contains the source translation catalogs.
- `project.inlang/` contains Paraglide and Inlang configuration.
- `scripts/` contains build-time generators and data conversion scripts.

Generated Paraglide output under `src/paraglide/` and generated manifest locale
files under `public/_locales/` should not be edited manually.

## Localization

The UI uses Paraglide. Add or update the same message key in every supported
locale catalog under `src/locales/`. Keep message parameters consistent across
locales.

Use generated message functions in Svelte files:

```svelte
<script lang="ts">
  import { m } from '@/paraglide/messages.js';
</script>

<button>{m['common.actions.done']()}</button>
```

Use named parameters for substitutions:

```svelte
{m['common.navigation.step']({ step, total })}
```

Manifest messages are a separate build output derived from the same catalogs.
Only explicit manifest keys should be added to
`scripts/generate-manifest-locales.mjs`; WebExtension message keys cannot
contain dots.

After changing translations, regenerate Paraglide output and manifest files
through the normal commands:

```bash
pnpm prepare:paraglide
pnpm prepare:manifest-locales
```

Do not change translated wording casually when renaming or moving UI code.
Preserve existing message IDs unless a migration is intentional and includes
all locales and call sites.

## Code style

- Follow the existing TypeScript and Svelte patterns.
- Prefer precise types and existing helpers over broad casts.
- Keep comments limited to non-obvious decisions.
- Preserve accessibility attributes and keyboard behavior.
- Do not add analytics, tracking, or unnecessary network requests.
- Use the existing formatting and linting configuration.

## Pull requests

Pull requests should include:

- A clear summary of the user-visible or maintenance change.
- Any relevant issue reference.
- A description of browser-specific behavior, if applicable.
- Tests or validation commands run locally.
- Screenshots or a short recording for visible UI changes.
- Translation updates for every supported locale when UI text changes.

Please keep commits and pull requests reviewable, and call out known
limitations or follow-up work explicitly.
