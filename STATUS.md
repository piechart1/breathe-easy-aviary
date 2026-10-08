# Breathe - status

<!-- status:begin -->

_Generated 2026-10-08 by `~/tools/project-status/status.py`. Edit outside the markers only._

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

**Blocking (iOS):** Nothing. Note that it shipped with Expo's placeholder bundle id, `com.anonymous.breathe-easy`. A bundle id cannot be changed on an existing listing, so that name is permanent unless a separate listing is published.

**Blocking (Play Store):** `@kingstinct/react-native-healthkit` runs through 4 files including two screens. HealthKit has no Android equivalent, so this is a Health Connect rewrite or a cut feature - a product decision, not a build problem. The `android/` project already exists and the applicationId is set.

**Next:** Around 21 to 28 October 2026, run `marketing/check-ranks.py` and compare with the 7 Oct positions in `marketing/app-store-metadata.md`, to see what the new name, subtitle and keywords changed. Four shorts were made on 8 October 2026 and are in `~/Remotion/out/shorts/`. Suggested YouTube schedule: the app showcase now, Cyclic Hyperventilation a few days later, the World Mental Health Day one on 10 October and the National Bird Week one on 19 October. The App Store link for the channel is the `youtube` one in `marketing/campaign-links.md`. TikTok is not started. The store assets and the shorts are rendered from `~/Remotion`, which is not in git; its README covers how. The landing page at https://piechart1.github.io/breathe-easy-aviary/ (from `docs/`) shows the showcase video and links to the YouTube channel. Separately, settle the HealthKit question before touching the Android build.

**Android intent:** Possible, gated on the above.
