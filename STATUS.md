# Breathe - status

<!-- status:begin -->

_Generated 2026-10-07 by `~/tools/project-status/status.py`. Edit outside the markers only._

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

**Published.** Breathe Easy Aviary v1.0.1, released 2026-09-17, last updated 2026-09-23.

- Listing: https://apps.apple.com/gb/app/breathe-easy-aviary/id6806774681?uo=4
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

**State:** The only published app. Live since 17 September as Breathe Easy Aviary; v1.0.1 is the version on the App Store. The repo is at 1.0.2 (build 4), not yet submitted. One test file.

**Blocking (iOS):** Nothing. Note that it shipped with Expo's placeholder bundle id, `com.anonymous.breathe-easy`. A bundle id cannot be changed on an existing listing, so that name is permanent unless a separate listing is published.

**Blocking (Play Store):** `@kingstinct/react-native-healthkit` runs through 4 files including two screens. HealthKit has no Android equivalent, so this is a Health Connect rewrite or a cut feature - a product decision, not a build problem. The `android/` project already exists and the applicationId is set.

**Next:** Submit 1.0.2. The app work is done as of 7 Oct: the Home screen changes from the Impeccable critique, a bird per breathing pattern, system navigation bar titles on the other tabs, a Haptics switch and an in-app rating prompt. Still to do before submitting: check on a phone (Plus subscriber at launch, Haptics switch, VoiceOver, rating prompt), re-capture the App Store screenshots and preview video in `~/Remotion` because the screens now look different, then enter the new name ("Breathe Easy Aviary Breathwork"), subtitle, keywords and Marketing URL from `marketing/app-store-metadata.md` in App Store Connect. Landing page is live at https://piechart1.github.io/breathe-easy-aviary/ (from `docs/`). Separately, settle the HealthKit question before touching the Android build.

**Android intent:** Possible, gated on the above.
