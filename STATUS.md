# Breathe - status

<!-- status:begin -->

_Generated 2026-09-21 by `~/tools/project-status/status.py`. Edit outside the markers only._

## At a glance

| | |
|---|---|
| Stack | React Native 0.86.2 / Expo ~57.0.13, 34 dependencies |
| App name | Breathe Easy |
| Version | 1.0.0 |
| Bundle id | `com.anonymous.breathe-easy` |
| Test files | 1 |
| Remote | https://github.com/piechart1/breathe-easy-aviary.git |

## iOS / App Store

**Published.** Breathe Easy Aviary v1.0, released 2026-09-17, last updated 2026-09-18.

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

**State:** The only published app. Live since 17 September as Breathe Easy Aviary, v1.0.0. No test files.

**Blocking (iOS):** Nothing. Note that it shipped with Expo's placeholder bundle id, `com.anonymous.breathe-easy`. A bundle id cannot be changed on an existing listing, so that name is permanent unless a separate listing is published.

**Blocking (Play Store):** `@kingstinct/react-native-healthkit` runs through 4 files including two screens. HealthKit has no Android equivalent, so this is a Health Connect rewrite or a cut feature - a product decision, not a build problem. The `android/` project already exists and the applicationId is set.

**Next:** Settle the HealthKit question before touching the Android build.

**Android intent:** Possible, gated on the above.
