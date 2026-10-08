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

**State:** The only published app. Live since 17 September as Breathe Easy Aviary; v1.0.1 is the version on the App Store. 1.0.2 (build 4) was submitted for review on 7 October 2026 and is waiting for review. One test file.

**Blocking (iOS):** Nothing. Note that it shipped with Expo's placeholder bundle id, `com.anonymous.breathe-easy`. A bundle id cannot be changed on an existing listing, so that name is permanent unless a separate listing is published.

**Blocking (Play Store):** `@kingstinct/react-native-healthkit` runs through 4 files including two screens. HealthKit has no Android equivalent, so this is a Health Connect rewrite or a cut feature - a product decision, not a build problem. The `android/` project already exists and the applicationId is set.

**Next:** Wait for App Review on 1.0.2, which carries the new App Store name ("Breathe Easy Aviary Breathwork"), subtitle, keywords, screenshots and preview video along with the Home screen changes, a bird per breathing pattern, navigation bar titles, a Haptics switch and a rating prompt. Once it is live: run `marketing/check-ranks.py` two to three weeks later and compare with the 7 Oct positions in `marketing/app-store-metadata.md`, and start posting on YouTube and TikTok with the links in `marketing/campaign-links.md`. Four shorts were made on 8 October 2026 and are in `~/Remotion/out/shorts/`: one for World Mental Health Day (10 October), one for National Bird Week (19 to 25 October), an app showcase, and one on Cyclic Hyperventilation. The Bird Week short and the showcase show 1.0.2 features, so post those once 1.0.2 is live. The store assets and the shorts are rendered from `~/Remotion`, which is not in git; its README covers how. Landing page is live at https://piechart1.github.io/breathe-easy-aviary/ (from `docs/`). Separately, settle the HealthKit question before touching the Android build.

**Android intent:** Possible, gated on the above.
