# Contributing

Thanks for your interest! Bug reports, measurement corrections, translations and code are all welcome.

## Correcting a preset measurement

LinkedIn does not publish its display dimensions, so the presets in `src/presets.ts` rely on measurements. If you notice a mismatch, open a **Preset measurement** issue with:

- the view (company page or profile, desktop or mobile) and the device or browser width;
- a screenshot of the real LinkedIn page;
- the values you measured (banner height, avatar size, left offset, overlap).

Measurements from a screenshot you took yourself are the most useful. Please say how you measured.

## Adding a language

See [Adding a language](README.md#adding-a-language) in the README. TypeScript and a test make sure every language has exactly the same keys as English.

## Development

Requires Node.js 20 or later.

```sh
npm install
npm run dev
```

Before opening a pull request, run:

```sh
npm run lint && npm run typecheck && npm run format:check && npm test && npm run build && npm run test:e2e
```

CI runs the same checks. `npm run format` fixes formatting for you.

Optionally, `npm run mutation` runs [Stryker](https://stryker-mutator.io/) on the layout and i18n logic: it changes the code in small ways and checks that the unit tests notice. Open `reports/mutation/index.html` to see which changes survived. It takes about a minute, so it is not part of the CI.

## Pull requests

- Keep them focused: one change per pull request.
- Describe what changes for the user, and how you checked it. For visual changes, attach a before/after screenshot.
- URL parameters (`?mode=`, `zone`, `ghost`, `lang`) and preset keys (`page-desktop`, `profil-mobile`, ...) are public: don't rename them without discussion.
- The tool must keep working without sending anything over the network.
