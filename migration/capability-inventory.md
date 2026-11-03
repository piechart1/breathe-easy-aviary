# Capability Inventory — Breathe Easy Aviary

- **Repo:** https://github.com/piechart1/breathe-easy-aviary, branch `main`, commit `60e11f4`
- **Stack:** Expo SDK 57 / React Native 0.86.3 / expo-router (`package.json`)
- **Scope:** Read-only scan. No files in the repository were changed. Paths are relative to the repo root. Line numbers were checked against the file contents at this commit.
- **No native projects are checked in.** There are no `ios/` or `android/` folders. Native configuration comes only from `app.json` and the config plugins.

---

## 1. Capabilities by screen or feature

### 1.1 App shell and navigation
| Capability | Description | Evidence |
|---|---|---|
| Root stack | A stack with the `(tabs)` group and an `articles/[slug]` detail route. Headers are hidden. | `src/app/_layout.tsx:36-39` |
| Light and dark theme | Uses React Navigation's Dark or Default theme, depending on the system colour scheme. | `src/app/_layout.tsx:22,33`; `app.json` `"userInterfaceStyle": "automatic"` (line 8) |
| Five-tab bar | Tabs: Home (`index`), Metrics (`history`), Reading (`articles`), About, and Settings. Each tab icon has an iOS SF Symbol and an Android/web Material icon. | `src/app/(tabs)/_layout.tsx:20-76` |
| Splash screen | The splash stays visible until the app hides it. An animated overlay then hides it. | `src/app/_layout.tsx:12`; `src/components/animated-icon.tsx:11,52` |
| Safety disclaimer gate (first launch) | A full-screen overlay that blocks the app until the user taps "I Understand & Agree". The gate stays up while the saved answer is still loading. Acceptance is saved. The overlay links to the Terms and Privacy pages. | `src/components/safety-disclaimer-gate.tsx:16-85`; `src/lib/settings.ts:294-301`; mounted at `src/app/_layout.tsx:35` |
| RevenueCat set-up at module load | `initPurchases()` runs before any component renders. | `src/app/_layout.tsx:19`; `src/lib/purchases.ts:53-63` |
| Opt-in telemetry set-up at launch | Telemetry starts only if the saved analytics flag is true. | `src/app/_layout.tsx:24-30` |

### 1.2 Home / Breathing screen (`src/components/breathing-screen.tsx`, 2390 lines; route `src/app/(tabs)/index.tsx`)
| Capability | Description | Evidence |
|---|---|---|
| Breathing pattern catalogue | 7 patterns. Five are `guided`: Box, 4-7-8, Resonance, Cyclic Sighing and Ujjayi. Two are `advanced`: Buteyko and Cyclic Hyperventilation (`tummo`). Each pattern has phase durations and a target scale for the breath circle. | `src/constants/breathing-patterns.ts:147-260` (categories at lines 152,166,179,191,204,216,231) |
| Plus gating of advanced patterns | Starting an `advanced` pattern without Plus opens the paywall, unless the entitlement lookup is still pending. The grace period for that lookup is 3 s. | `breathing-screen.tsx:112,881-888,1584-1592` |
| Start and stop a session; complete a session | When a session stops, the screen clears its timers, fades the music, records the time, adds haptics and an accessibility announcement, and logs the session to analytics and HealthKit. | `breathing-screen.tsx:1140-1198` |
| Remembers the last pattern | The last-selected pattern is restored on mount. | `breathing-screen.tsx:1000-1006`; `src/lib/settings.ts:307-313` |
| Auto Stop timer | Off, or 1–30 minutes. Set on Home (`TIMER_MINUTE_OPTIONS`). The session ends at the end of an exhale once the time is reached. | `breathing-screen.tsx:837-852,1372-1383,1431-1440,1668-1670`; `src/lib/settings.ts:24-51` |
| Auto Stop menu and pattern info: iOS vs others | On iOS these use SwiftUI `Menu` and `BottomSheet` from `@expo/ui/swift-ui`. Other platforms use RN `Modal`s. | `breathing-screen.tsx:23,107-111,1778,2000-2027,2038` |
| Audio cue styles | "Voice" (resonant, spoken cues) or "Metronome" (tick sound). Each cue is pre-loaded in its own player. | `breathing-screen.tsx:685,721-752`; `src/lib/settings.ts:121-134`; `settings-screen.tsx:75-78` |
| Backing music rotation | Plus users move through a rotation index that is saved between launches. Free users always get index 1 ("Enlivening"). | `breathing-screen.tsx:1492-1494`; `src/lib/backing-music.ts:27-50` |
| Tummo soundtrack sets | Set 1, Set 2 or Off. Each set has a main track and an integration track. The integration track fades out at the end. | `src/lib/backing-music.ts:56-68`; `breathing-screen.tsx:713-716,1241-1277` |
| Tummo options | Rounds (1–3); hold mode (`dynamic` = tap to advance, or `preset` = 1–300 s); Integration on/off and length (3, 6 or 9 min); dev-only "skip to hold". | `src/lib/settings.ts:136-245`; `breathing-screen.tsx:950-952,977-984` |
| Buteyko hold length | 1–300 s, default 15. | `src/lib/settings.ts:27-29,53-65` |
| Haptics | Light, medium or selection taps at phase changes, and a success tap when a session ends. Can be turned off. | `breathing-screen.tsx:1157,1227-1233`; `src/lib/settings.ts:317-326` |
| Audio session and background audio | Plays in silent mode, uses `interruptionMode: 'doNotMix'`, and keeps playing in the background. | `breathing-screen.tsx:954-966` |
| Interruption handling | If music stays paused while the app is backgrounded (a call, or another app taking audio), the session ends and the audio session is released. | `breathing-screen.tsx:462-489` |
| Bird backdrop per pattern | Each pattern has a bird image behind the Home screen. The images fade in and out by opacity. | `breathing-screen.tsx:520-530,1744-1745`; `src/constants/pattern-birds.ts:18-20` |
| Accessibility announcements | "Session complete", "Session ended" or "Session stopped". | `breathing-screen.tsx:1159-1164` |
| App Store review prompt | Requested after the 3rd, 15th and 40th session that lasted at least 60 s. Only asked while the app is in the foreground, after a 2 s delay. | `src/lib/review-prompt.ts:5-46`; called at `breathing-screen.tsx:1152` |

### 1.3 Metrics (History) screen (`src/components/history-screen.tsx`)
| Capability | Description | Evidence |
|---|---|---|
| 14-day chart | Two 7-day bar charts with weekly totals. | `history-screen.tsx:42-91,105-121` |
| Streak and total sessions | Pills showing the day streak and the session count. | `history-screen.tsx:129-150`; `src/lib/session-history.ts:72-96` |
| Prompt to turn on Apple Health (iOS) | A tappable card that links to Settings. | `history-screen.tsx:109-111,174-197` |
| Reloads on focus | Data reloads every time the tab gains focus. | `history-screen.tsx:114-117` |

### 1.4 Reading (Articles) screen
| Capability | Description | Evidence |
|---|---|---|
| Article list | 4 articles, bundled locally in the app. | `src/constants/articles.ts:10-29`; `src/components/articles-screen.tsx:38` |
| Quote of the day | Picked by date. | `src/constants/quotes.ts:6,40`; `articles-screen.tsx:18` |
| Article detail page | Route `articles/[slug]` with bird images. | `src/app/articles/[slug].tsx:1`; `src/components/article-detail-screen.tsx:4-9,36,65` |

### 1.5 About screen (`src/components/about-screen.tsx`)
| Capability | Description | Evidence |
|---|---|---|
| Community world heatmap | Fetches public JSON counts (5 s timeout) and draws an SVG hex map. If the fetch fails, a placeholder is shown. | `about-screen.tsx:17-49,82-84`; `src/components/world-heatmap.tsx:2-4`; `src/constants/community-map.ts:5-6` |
| Analytics opt-in prompt | Shown when analytics is off. It links to Settings. | `about-screen.tsx:62-68,86-111` |
| Feedback by email | Opens `mailto:hello@piechartstudios.com`. | `about-screen.tsx:51,122` |
| "The Aviary" section | Lists the patterns and their birds. | `about-screen.tsx:9,11,128-130` |

### 1.6 Settings screen (`src/components/settings-screen.tsx`)
| Capability | Description | Evidence |
|---|---|---|
| Plus plan status, Upgrade, Restore Purchases | The Restore result is shown in an `Alert`. | `settings-screen.tsx:170-187,326-363` |
| Audio: cue style, haptics, backing music on/off, music volume slider (0–100) | | `settings-screen.tsx:369-455` |
| Buteyko hold-length picker | Uses `@expo/ui` `Picker`. | `settings-screen.tsx:457-480` |
| Cyclic Hyperventilation: rounds, soundtrack, hold mode or length, Integration | | `settings-screen.tsx:482-647` |
| Reminders: "Daily practice" and "Wind-down at night" | Each has a toggle and a time picker. If the OS permission is refused, the toggle switches back off. | `settings-screen.tsx:207-261,649-711` |
| Data: share anonymous usage and crash-data | Turns telemetry on or off straight away. | `settings-screen.tsx:189-197,713-731` |
| Data: log sessions to Apple Health (iOS only) | | `settings-screen.tsx:199-205,733-751` |
| Legal links | Privacy, Terms and Safety open in the in-app browser. | `settings-screen.tsx:71-73,754-780`; `src/constants/legal.ts:1-5` |
| Developer section (`__DEV__` only) | Force Plus, Skip to Hold, and Reset Test Account (RevenueCat). | `settings-screen.tsx:303-319,782-839`; `src/lib/purchases.ts:16-43,155-161` |

### 1.7 Monetisation (RevenueCat)
| Capability | Description | Evidence |
|---|---|---|
| `plus` entitlement | Checked through `useIsPlus()`, which also listens for changes. | `src/lib/purchases.ts:12,85-140` |
| Paywall set up in the RevenueCat dashboard | Shown with `presentPaywallIfNeeded`. | `src/lib/purchases.ts:167-179` |
| Restore purchases | | `src/lib/purchases.ts:80-83` |
| What Plus unlocks | Advanced patterns and the full music rotation. | `src/lib/purchases.ts:10-11`; `breathing-screen.tsx:1492-1494,1585` |

---

## 2. Native modules, Expo packages and third-party SDKs

The packages are listed in `package.json`. "Used for" is backed by an import site in the code.

| Package | Used for | Evidence of use |
|---|---|---|
| `expo-router` | File-based routing, tabs and stack | `src/app/_layout.tsx:2`; `src/app/(tabs)/_layout.tsx:1` |
| `expo-audio` | All sound playback and audio-session settings | `breathing-screen.tsx:18,954-966`; `backing-music.ts:2`; plugin set-up in `app.json` |
| `expo-haptics` | Haptic taps during a session | `breathing-screen.tsx:19,1157,1229-1233` |
| `expo-notifications` | Local weekly reminders (7 triggers per reminder) | `src/lib/notifications.ts:1,54-122` |
| `expo-store-review` | In-app review prompt | `src/lib/review-prompt.ts:2,40-41` |
| `expo-web-browser` | In-app browser for the legal pages | `safety-disclaimer-gate.tsx:4,12-14`; `settings-screen.tsx:68,71-73` |
| `expo-splash-screen` | Controls the splash screen | `src/app/_layout.tsx:3,12`; `animated-icon.tsx:2,52` |
| `expo-image` | Bird and art images | `breathing-screen.tsx:20`; `about-screen.tsx:4`; `article-detail-screen.tsx:5` |
| `expo-symbols` | SF Symbols on iOS, Material icons elsewhere | `src/app/(tabs)/_layout.tsx:2,25` |
| `@expo/ui` (`swift-ui`, `Picker`, `community/datetime-picker`, `community/slider`) | Native SwiftUI Menu and BottomSheet; pickers, slider and time picker in Settings | `breathing-screen.tsx:23-24`; `settings-screen.tsx:4-6` |
| `expo-build-properties` | `ios.enableSceneSupport: true` | `app.json` plugins |
| `@kingstinct/react-native-healthkit` (needs `react-native-nitro-modules`) | Writes Mindful Session samples (write only) | `src/lib/healthkit.ts:2-42` |
| `react-native-purchases` / `react-native-purchases-ui` (RevenueCat) | Subscriptions and paywall | `src/lib/purchases.ts:4-5` |
| `@sentry/react-native` | Crash reporting, opt-in, `sendDefaultPii: false` | `src/lib/telemetry.ts:1,36-45` |
| `posthog-react-native` | Analytics events `pattern_started` and `session_completed`, opt-in. App lifecycle events and session replay are turned off. | `src/lib/telemetry.ts:2,47-58,69-75` |
| `@react-native-async-storage/async-storage` | All on-device data storage | `src/lib/settings.ts:1` and others (see §4) |
| `react-native-svg` | World heatmap | `src/components/world-heatmap.tsx:2` |
| `react-native-reanimated` / `react-native-worklets` | Splash animation | `src/components/animated-icon.tsx:5-6` |
| `react-native-safe-area-context` | Safe-area layout | `breathing-screen.tsx:17`; `safety-disclaimer-gate.tsx:3` |
| `react-native-screens`, `react-native-web`, `react-dom` | Navigation and web dependencies | Only in `package.json`. No direct import was found under `src/`. |
| `expo-device`, `expo-glass-effect`, `expo-linking`, `expo-system-ui`, `expo-font`, `expo-constants`, `react-native-gesture-handler`, `expo-status-bar` | **No import found under `src/`**. They may be pulled in by other packages or not used at all. See Open Questions. | `package.json` only |

Custom config plugins:
- `plugins/withoutPushEntitlement.js:15-20` removes `aps-environment` from the iOS entitlements. The app only uses local notifications.
- `plugins/withSentryUploadDisabled.js:18-34` adds `SENTRY_DISABLE_AUTO_UPLOAD=true` to the Xcode build phases that upload Sentry sourcemaps and dSYMs.

---

## 3. Permissions, entitlements and settings (`app.json`)

`app.json` is the only config file. There is no `app.config.*`.

| Setting | Value |
|---|---|
| name / slug / version | "Breathe Easy Aviary" / `breathe-easy` / `1.0.2` |
| orientation | `portrait` |
| URL scheme | `breathe` |
| iOS bundle ID / build number / team | `com.anonymous.breathe-easy` / `4` / `9KNUWQFXQP` |
| iOS `usesNonExemptEncryption` | `false` |
| Android package | `com.davidslee.breatheeasyaviary` |
| Android permissions | `MODIFY_AUDIO_SETTINGS`, `FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_MEDIA_PLAYBACK` |
| Android | Adaptive icon (including monochrome); `predictiveBackGestureEnabled: false` |
| expo-audio plugin | `microphonePermission: false`, `recordAudioAndroid: false` |
| HealthKit plugin | `NSHealthShareUsageDescription` (says the app does not read Health data), `NSHealthUpdateUsageDescription` (Mindful Minutes), `background: false` |
| expo-notifications plugin | Included. The `aps-environment` entitlement is then removed by the custom plugin. |
| expo-build-properties | `ios.enableSceneSupport: true` |
| Web | `output: static` |
| Experiments | `typedRoutes`, `reactCompiler` |

Runtime permission prompts in the code:
- **Notifications:** asked for only when a reminder is turned on (`src/lib/notifications.ts:45-52`).
- **HealthKit write access:** asked for when Health sync is turned on, and again before each write (`src/lib/healthkit.ts:17-26`; `settings-screen.tsx:199-205`).

---

## 4. Data storage, network calls and background tasks

### 4.1 Local storage (AsyncStorage only)
There is no database, Keychain or file storage. All keys start with `breathe-easy:`.

| Key(s) | Purpose | Evidence |
|---|---|---|
| `daily-session-seconds`, `daily-session-counts` | JSON maps of `YYYY-MM-DD` → seconds or session count | `src/lib/session-history.ts:3-4,43-55` |
| `timer-enabled`, `timer-minutes`, `buteyko-hold-seconds`, `analytics-enabled`, `health-sync-enabled`, `backing-music-enabled`, `backing-music-volume`, `sound-style`, `tummo-*` (7 keys), `daily-nudge`, `wind-down` (JSON), `has-accepted-safety-disclaimer`, `last-pattern-id`, `haptics-enabled` | User settings | `src/lib/settings.ts:3-22` |
| `backing-music-rotation-index` | Music rotation position | `src/lib/backing-music.ts:6,44-50` |
| `review-qualifying-sessions` | Counter for the review prompt | `src/lib/review-prompt.ts:5,27-29` |
| `dev-plus-override` | Dev-only Plus override | `src/lib/purchases.ts:21,26-43` |

Third-party SDKs (RevenueCat, PostHog, Sentry) also keep their own storage on the device. For example, the PostHog opt-out flag is mentioned at `telemetry.ts:22-29`.

### 4.2 Network calls
| Call | Evidence |
|---|---|
| `GET https://breathe.piechartstudios.com/data/community-map-counts.json` (plain `fetch`, 5 s abort) | `src/constants/community-map.ts:5-6`; `about-screen.tsx:26-46` |
| RevenueCat SDK (configure, customer info, restore, paywall, logIn/logOut) | `src/lib/purchases.ts:61,70,81,159-160,169` |
| PostHog (default host `https://us.i.posthog.com`, can be changed with an env var), opt-in only | `src/lib/telemetry.ts:5-6,47-58` |
| Sentry (DSN from env), opt-in only | `src/lib/telemetry.ts:4,36-45` |
| External links: legal pages (`claude.ai/code/artifact/...`) and `mailto:` | `src/constants/legal.ts:1-5`; `about-screen.tsx:122` |

Environment variables (`.env.example:8-30`): `EXPO_PUBLIC_SENTRY_DSN`, `EXPO_PUBLIC_POSTHOG_API_KEY`, `EXPO_PUBLIC_POSTHOG_HOST`, `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY`, `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY`, `SENTRY_DISABLE_AUTO_UPLOAD`.

### 4.3 Background and scheduled work
| Item | Evidence |
|---|---|
| Background audio playback during a session (`shouldPlayInBackground: true`) | `breathing-screen.tsx:965` |
| Local repeating notifications: 7 weekly triggers each for "Daily practice" (default 09:00) and "Wind down" (default 21:00), with a different message each weekday | `src/lib/notifications.ts:12-32,54-122`; `src/lib/settings.ts:270-273` |
| No background fetch or task manager | No `expo-task-manager` or `expo-background-fetch` in `package.json` |
| Server side (not part of the app): a daily GitHub Action at 04:00 UTC pulls PostHog location data into hex counts and commits `data/` and `docs/data/community-map-counts.json` | `.github/workflows/update-community-map.yml:3-43`; `scripts/aggregate-community-map.mjs` |

---

## 5. Platform-specific behaviour

| Behaviour | iOS | Android / web | Evidence |
|---|---|---|---|
| HealthKit Mindful Minutes | Supported | Returns `false` (not supported) | `src/lib/healthkit.ts:18-20` |
| "Log to Apple Health" toggle | Shown | Hidden | `settings-screen.tsx:733` |
| Health hint on Metrics | Loaded | Not loaded | `history-screen.tsx:109-111` |
| Auto Stop menu and pattern info sheet | SwiftUI `Menu` / `BottomSheet` | RN `Modal` | `breathing-screen.tsx:107-111,1778,2000,2038` |
| RevenueCat API key | iOS key | Android key | `src/lib/purchases.ts:7-8,57` |
| Screen gutter | iOS-specific calculation | Different value | `src/hooks/use-screen-gutter.ts:13` |
| Icons | SF Symbols | Material icon names | `src/app/(tabs)/_layout.tsx:25,35,48,60,70` |
| Splash animation | `animated-icon.tsx` | Web version in `animated-icon.web.tsx` (CSS module) | both files |
| Colour-scheme hook | `use-color-scheme.ts` | Web version `use-color-scheme.web.ts` | `src/hooks/` |
| Push entitlement removed | iOS only (Entitlements.plist) | — | `plugins/withoutPushEntitlement.js` |
| Sentry build-phase patch | iOS only (Xcode project) | — | `plugins/withSentryUploadDisabled.js` |
| Foreground-service media playback permissions | — | Android | `app.json` `android.permissions` |

---

## 6. Open Questions (could not be confirmed from the code)

1. **Backing-music rotation array may be indexed past its end.** `BACKING_MUSIC_ROTATION_SOURCES` has 4 entries (`src/lib/backing-music.ts:27-32`). `breathing-screen.tsx:694-700` creates players for indices 0–6, so indices 4–6 resolve to `undefined`. `getNextBackingMusicTrackIndex` wraps at 4, so those players may never be chosen. How `useAudioPlayer(undefined)` behaves was not checked. A Swift port should confirm how many tracks are intended.
2. **iOS `UIBackgroundModes: audio`.** A comment at `breathing-screen.tsx:955-958` says this is "already present", but `app.json` does not declare it and there is no `ios/` folder. It may be added by the expo-audio plugin. This needs checking in a prebuilt project.
3. **Unused dependencies.** No `src/` import was found for `expo-device`, `expo-glass-effect`, `expo-linking`, `expo-system-ui`, `expo-font`, `expo-constants`, `react-native-gesture-handler` or `expo-status-bar`. It is unclear whether they are needed at runtime.
4. **Components that are never used.** `ExternalLink`, `WebBadge`, `Collapsible` and `HintRow` (`src/components/external-link.tsx`, `web-badge.tsx`, `ui/collapsible.tsx`, `hint-row.tsx`) are not referenced anywhere else in `src/`. They may be left over from the Expo template.
5. **Bundle ID mismatch.** The iOS bundle ID is `com.anonymous.breathe-easy` but the Android package is `com.davidslee.breatheeasyaviary`. It is unclear which iOS identifier is the production one (the App Store listing in `marketing/` was not checked).
6. **RevenueCat set-up is outside the repo.** The products, the paywall layout and the price of `plus` are configured in the dashboard and cannot be seen in code. Whether Plus is a subscription is only suggested by the UI text ("Plus subscription", `settings-screen.tsx:180`).
7. **Where the community-map location data comes from.** The app does not send any location explicitly (`telemetry.ts:69-75`). The aggregation script reads PostHog location data, presumably from PostHog's IP geolocation. That was not verified in `scripts/aggregate-community-map.mjs`.
8. **Legal pages are hosted on a `claude.ai/code/artifact/...` URL** (`src/constants/legal.ts:1`). It is unclear whether that is the production location.
9. **Android parity.** Whether the Android build is tested or shipped, and how `@expo/ui` Picker, Slider and DateTimePicker behave on Android, cannot be confirmed from the code alone.
10. **Web target.** `web.output: static` is configured, but whether the web build is a supported product (rather than a dev preview) is unknown. `purchases.ts:174-175` mentions a "web preview".
11. **Tests.** Only `src/constants/__tests__/breathing-patterns.test.ts` exists. The runtime behaviour above was not checked by running anything.
