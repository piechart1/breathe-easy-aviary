# Breathe - status

<!-- status:begin -->

_Generated 2026-10-23 by `~/tools/project-status/status.py`. Edit outside the markers only._

## At a glance

| | |
|---|---|
| Stack | React Native 0.86.3 / Expo ^57.0.24, 36 dependencies |
| App name | Breathe Easy Aviary |
| Version | 1.0.2 |
| Bundle id | `com.anonymous.breathe-easy` |
| Test files | 1 |
| Remote | https://github.com/piechart1/breathe-easy-aviary.git |

## iOS / App Store

**Published.** Breathe Easy Aviary Breathwork v1.0.2, released 2026-09-17, last updated 2026-10-07.

- Listing: https://apps.apple.com/gb/app/breathe-easy-aviary-breathwork/id6806774681?uo=4
- Seller: DAVID PHILIP SLEE

## Android / Play Store

**Not on the Play Store.**

- Android project: `android`
- applicationId: `com.davidslee.breatheeasyaviary`
- versionCode: -

- iOS-only packages **in use**: `@kingstinct/react-native-healthkit`, `expo-symbols`
- iOS-only packages declared but unused: `expo-glass-effect`

<!-- status:end -->

## Judgement

_This section is yours. The generator never touches it._

**State:** The only published app. Live since 17 September 2026. v1.0.2 (build 4) has been on the App Store since 7 October 2026, under the listing name "Breathe Easy Aviary Breathwork"; the name on the home screen is still Breathe Easy Aviary. One test file.

**Blocking (iOS):** Nothing. Builds with Xcode 27.1 need `expo-modules-core` 57.0.24 or later (Expo's fix for Xcode 27); the lockfile was moved to it on 23 Oct 2026, and builds failed before that. `npx expo install --check` still lists 10 other Expo packages a few patch versions behind. Note that it shipped with Expo's placeholder bundle id, `com.anonymous.breathe-easy`. A bundle id cannot be changed on an existing listing, so that name is permanent unless a separate listing is published.

**Blocking (Play Store):** `@kingstinct/react-native-healthkit` runs through 4 files including two screens. HealthKit has no Android equivalent, so this is a Health Connect rewrite or a cut feature - a product decision, not a build problem. The `android/` project already exists and the applicationId is set.

**Next:** Ship 1.0.3. It carries the Home screen fixes from the 23 Oct Impeccable re-critique (score 26 → 28/40, reports in `.impeccable/critique/`) and the new subtitle and keyword field drafted in `marketing/app-store-metadata.md` ("1.0.3 proposal"). A Cyclic Hyperventilation custom product page was submitted for review on 23 Oct with the keyword `tummo`; once 1.0.3 is approved, add `hyperventilation` and `hold` to it. Its screenshots are rendered from `~/Remotion` (not in git; its README covers how). Open critique items, deferred: light-mode contrast of the pale circles and selected card, a visible stop hint, the bird overlapping the timing line at the largest text sizes (left as is by choice). Marketing: YouTube shorts are up; TikTok is not started. Separately, settle the HealthKit question before touching the Android build.

**Android intent:** Possible, gated on the above.
