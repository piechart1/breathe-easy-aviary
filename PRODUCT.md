# Product

<!-- impeccable:product-schema 1 -->

## Platform

ios

## Users

People who use the app as a daily practice: a reminder-driven routine of guided breathing sessions, tracked in the Metrics tab and logged to Apple Health as Mindful Minutes. A smaller group of advanced practitioners use the Buteyko and Cyclic Hyperventilation (Tummo) patterns, which have configurable holds and rounds. Other situations (for example, falling asleep to a session with the screen locked) are supported by the audio design but were not confirmed as the primary use.

## Product Purpose

Breathe Easy Aviary is a guided breathing app. It walks the user through seven breathing patterns (Box, 4-7-8, Resonance, Cyclic Sighing, Ujjayi, Buteyko, and Cyclic Hyperventilation), with spoken cues or a metronome and backing music timed to each phase. Success is the user returning to a regular daily practice.

## Positioning

The Aviary and Australian-birds identity: bird imagery and a Melbourne-made personality, with a live community map of sessions on the About screen. This is the claim a neighboring breathing app could not truthfully copy.

## Operating Context

- Sessions run on a phone, often with audio leading. Audio keeps playing with the screen locked, and a session ends cleanly if another app takes audio focus.
- Daily practice and wind-down reminders are delivered through local notifications.
- A Plus subscription (RevenueCat) unlocks the full pattern library. Guided patterns are free and advanced patterns require Plus.

## Capabilities and Constraints

- Built with Expo (SDK 57) and React Native, with file-based routing in `src/app`. Screens live in `src/components`, app logic in `src/lib`, and static data (patterns, articles, theme, legal copy) in `src/constants`.
- Published on the App Store as "Breathe Easy Aviary" (v1.0, released 2026-09-17). The app shows the same name on the home screen and in its Home header. The bundle id `com.anonymous.breathe-easy` is permanent for that listing.
- Not on the Play Store. HealthKit has no Android equivalent, so Android is gated on an undecided product choice between a Health Connect rewrite and cutting the feature.
- Sound styles are Voice (resonant spoken cues) and Tick (metronome). Cyclic Hyperventilation is the user-facing name for the pattern coded as `tummo`.
- Opt-in telemetry (PostHog, Sentry) stays off unless the user enables it. The App Store privacy declarations must stay accurate to the real data flows.
- A first-launch safety disclaimer gate is shown before the tab navigator.
- Undecided: Android; the avatar picker and customizable Metrics profile (five birds, with Plus gating to be reconfirmed); a custom domain for the landing page.

## Brand Commitments

- Name: "Breathe Easy Aviary" on the App Store and in legal copy. The in-app name is the same.
- Identity centered on Australian birds. The avatar picker candidates are Cockatoo, Splendid fairywren, Mallee ringneck, Eastern rosella and Barn owl. Each breathing pattern has its own background bird on Home (magpie, kookaburra, emu, variegated fairywren, Gouldian finch, Major Mitchell's cockatoo, sulphur-crested cockatoo), listed on the About screen.
- Voice: plain, calm, and based in Melbourne, Australia.

## Evidence on Hand

- Live landing page at https://piechart1.github.io/breathe-easy-aviary/ (source in `docs/`; the video on the page is `showcase.mp4` with `showcase-poster.jpg`).
- App Store listing: https://apps.apple.com/gb/app/breathe-easy-aviary/id6806774681
- Marketing drafts in `marketing/` (subtitle, keywords, promo text, search-rank checks) and app icon assets in `handoff/`.
- No testimonials, reviews, customer counts or benchmarks are on hand. Do not fabricate them.

## Product Principles

- Support a daily habit first. Starting and returning to a session should take very little effort.
- Make the bird identity a lasting part of the product, not a decoration added to a generic breathing timer.
- Audio leads. The experience must work with the screen locked or dim.
- Keep the safety framing and privacy promises accurate wherever the product makes claims about health or data.

## Accessibility & Inclusion

Phase text uses a polite live region and the main controls have accessibility labels. No further product-specific requirement has been established.
