# Breathe Easy Aviary

A guided breathing app for iOS and Android, built with [Expo](https://expo.dev) and React Native. It walks through seven breathing patterns (Box, 4-7-8, Resonance, Cyclic Sighing, Ujjayi, Buteyko, and Cyclic Hyperventilation), each with voice cues and backing music timed to the phases.

Other features:

- Daily practice and wind-down reminders (`expo-notifications`)
- Completed sessions logged to Apple Health as Mindful Minutes (`@kingstinct/react-native-healthkit`, iOS only)
- A Plus subscription (RevenueCat) unlocking the full pattern library
- Opt-in crash reporting (Sentry) and product analytics (PostHog) — both stay off unless the user enables them, and unless the corresponding env vars are set
- A live community map on the About screen, backed by a small pipeline described in [`scripts/aggregate-community-map.mjs`](scripts/aggregate-community-map.mjs)

## Project structure

Routes live under [`src/app`](src/app) (file-based routing via `expo-router`), with screens in [`src/components`](src/components), app logic in [`src/lib`](src/lib), and static data (breathing patterns, articles, theme, legal copy) in [`src/constants`](src/constants).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in any keys you want live (Sentry, PostHog, RevenueCat). Everything works with these left blank — the corresponding feature just stays off.

3. Start the app

   ```bash
   npx expo start
   ```

   Or run directly on a platform:

   ```bash
   npm run ios
   npm run android
   npm run web
   ```

## Testing

```bash
npm test
```

Jest is set up via `jest-expo`. Coverage is minimal so far — one smoke-test suite over the breathing pattern data in [`src/constants`](src/constants/__tests__).

## Scripts

- `npm run lint` — ESLint via `expo lint`
- `npm run generate-world-hex-grid` — regenerates the hex grid used by the community map
- `npm run aggregate-community-map` — pulls session counts from PostHog and publishes them for the community map (runs on a schedule via [`.github/workflows`](.github/workflows))
