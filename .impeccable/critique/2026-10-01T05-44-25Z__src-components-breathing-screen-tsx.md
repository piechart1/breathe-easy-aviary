---
target: breathing screen
total_score: 26
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:/Users/DavidSlee/Breathe/src/components/breathing-screen.tsx"
target_fingerprint: "sha256:204dff2e785973fc65c1f66cc4735ff0b731ae63f8a2b78a19dfcfbae9bf54df"
target_path: /Users/DavidSlee/Breathe/src/components/breathing-screen.tsx
timestamp: 2026-10-01T05-44-25Z
slug: src-components-breathing-screen-tsx
---
# Critique: Breathing screen (src/components/breathing-screen.tsx)

Method: dual-agent. Detector returned [] (not applicable to native). tsc: no errors in target.

## Score: 26/40 (Acceptable)
1 Status 3 | 2 Real world 3 | 3 Control 3 | 4 Consistency 3 | 5 Error prevention 2 | 6 Recognition 2 | 7 Efficiency 2 | 8 Minimal 3 | 9 Error recovery 2 | 10 Help 3

## Specificity
Behavior is distinctive (pattern-owned circle color, Tummo cues, haptics, music). Visual surface is interchangeable; the bird identity is a 20% backdrop behind opaque cards.

## Priority issues
- [P1] Selected pattern unnamed in hero and not remembered between launches (:707, :1469-1507). Fix: persist last pattern, show name above phase text, scroll to top on select. Commands: clarify, layout.
- [P1] Session end is silent, abrupt, unacknowledged (:917-958, :1357-1361). Fix: finish phase on Auto Stop, fade music, closing bell/bird call, show minutes logged, success haptic. Commands: delight, animate.
- [P1] Running state keeps seven cards; Tummo dynamic hold risks accidental stop (:1444, :1510, :1786). Fix: collapse list while running, larger hold button, long-press/confirm to stop in Tummo, move #152A63 into theme. Commands: distill, harden.
- [P2] Accessibility: tap targets under 44pt, light-mode contrast (secondary text 4.40:1 on cards, selected-card cue ~1.1-1.35:1, pastel circle 1.5-2.1:1 on white), iOS live region unconfirmed, overlays not modal, fixed line heights, no Reduce Motion. Commands: harden, adapt.
- [P2] Bird identity is a faint backdrop, not a feature. Commands: shape, bolder.
- [P3] Native iOS fit: custom modals, centered subtitle, raw hex, 16pt body. Commands: adapt, polish.

## Cognitive load
5 of 8 fail: single focus, chunking, one thing at a time, minimal choices, working memory.

## Heuristic key issues
1 Status (3): no remaining time under Auto Stop, no round/breath count for Tummo, no end-of-session acknowledgement (:1469-1507, :949-958).
2 Real world (3): "30 breaths-hold-1-15" (breathing-patterns.ts:228) and "Tap to move to Inhale and Retention" (:1522) are notation/jargon.
3 Control (3): stop is one tap; no pause; the start target is also the stop target (:1444-1445).
4 Consistency (3): custom overlay modals (:1582-1655) and hardcoded #152A63 (:1786) depart from native and DESIGN.md.
5 Error prevention (2): stray tap on the circle during Tummo hold ends and logs the session; Plus user can hit the paywall while entitlement loads (:755, :1321).
6 Recognition (2): selected pattern name is not near the circle; selection resets to Box each launch (:707).
7 Efficiency (2): no way to resume usual pattern; lower patterns need scroll, tap, scroll back.
8 Minimal (3): timing text repeated in hero and card (:1486, :524); seven cards stay visible while running.
9 Error recovery (2): audio failures only reach the console (:1266, :1280); external interruption ends the session silently (:419-436).
10 Help (3): per-pattern info modal is good but a long text block; no first-run orientation.

## Cognitive load (5 of 8 fail, critical band)
Fail: single focus; chunking (Guided has 5 cards, 7 total); one thing at a time (configure, choose, perform share one scroll); minimal choices (7 patterns, 7 info icons, pill, locks); working memory (compare timings, scroll up, remember selection).
Pass: grouping; hierarchy (caveat: selected name missing); progressive disclosure.

## Emotional journey
- Start: no ready beat; circle snaps to minimum scale, haptic and voice cue fire at once, music at 200 ms (:1328, :1338-1342). "Tap to begin" is the only cue that the circle is the button.
- During: good (scale, ticks or voice, haptics, Tummo reassurance cues). No visual breath or round count.
- Peak: Tummo hold cues, bells, minute callouts (:279-289); the visible UI adds nothing.
- End (weakest): Auto Stop can cut mid-inhale (:1357-1361); all players pause at once with no fade (:931-935); only Tummo fades with a closing cue (:1034-1071); screen resets to 0:00 and "Tap to begin" with no "done" or minutes logged.

## Strengths
1. Breath circle is a clear single hero: pattern color, tabular elapsed time, bold active segment.
2. Audio-led design works locked or dim (:822).
3. Card accessibility labels carry name, timing, description, locked, selected, disabled.

## P2 accessibility detail
- Targets under 44pt: Auto Stop pill ~28 (:1691-1700), minute pills ~28 (:1709-1717), Close ~36 (:1860-1864), info icon 18 + 10 hitSlop ~38 (:535-545), hold button ~36 (:1780-1787).
- Contrast (agent-calculated), light: secondary text 4.83:1 on white, 4.40:1 on card, 4.01:1 on selected card; #3B82F6 Close on card 3.34:1; pastel circle on white Box 1.49, Resonance 1.61, Cyclic Sighing 1.63, Ember Orange 3.3. Selected-card fill step ~1.1:1; pastel border vs selected fill ~1.2-1.35:1. Dark is fine (secondary 6.15/5.24/4.62; circle 9-12:1). Hold button navy on #0D1117 ~1.4:1 (white text on navy 13.6:1).
- accessibilityLiveRegion (:1473) is documented Android-only in React Native; iOS announcement unconfirmed. If it does speak, it could talk over voice cues every ~1.5 s in Tummo. Consider AccessibilityInfo.announceForAccessibility for start, stop and session end only.
- Overlays (:1582, :1598) are in-tree views without accessibilityViewIsModal; VoiceOver can reach content behind and the tab bar stays reachable.
- Fixed line heights (:1757-1775, :1799, :1859) clip at large Dynamic Type; 240pt circle wrapper and patternName paddingRight 48 (:1827) do not adapt.
- No AccessibilityInfo.isReduceMotionEnabled anywhere in the file.
- Locked-card label ends ", Plus" (:517); timing read as "4-4-4-4".
- Bird art at 20%: keep page-level phase text off it (secondary text over the art ~3.0-3.4:1).

## P3 native iOS fit
Hand-built modals, centered subtitle instead of nav title, raw hex (no increased-contrast support), body text 16pt vs 17pt default, app-tabs.tsx declares only the index trigger. Suggested: system sheet (Expo Router form sheet or @expo/ui BottomSheet), native Menu or Picker for Auto Stop.

## Persona red flags
Casey (distracted mobile): must scroll to change pattern, cannot resume last (:707); stray touch on circle stops with no confirmation (:1444); ~28pt pills (:1691, :1709); Auto Stop pill disappears for Tummo, shifting layout ~50pt (:1427).
Sam (accessibility): live region unconfirmed on iOS; non-modal overlays, tab bar reachable; small targets and weak selected-state contrast; fixed line heights; no Reduce Motion; "Tap to Unlock Plus" hidden inside a status label VoiceOver reads as "Breathing status".
Jordan (first-timer): nothing says the circle is the button beyond "Tap to begin"; descriptions are mechanical ("Inhale, hold, exhale, hold", breathing-patterns.ts:150), no "for calm/sleep/focus"; "4-4-4-4" and "30 breaths-hold-1-15" unlabeled; lock icon unexplained until the paywall; Tummo safety text only in the info modal (breathing-patterns.ts:230).
Daily-practice regular (6:30am, same pattern, eyes closed, dim): pattern resets each launch; opens on the full list; circle is also the stop target; no remaining time under Auto Stop; no end acknowledgement or streak; Plus subscriber on cold start can see locked cards and reach the paywall while entitlement loads (:752-755, :1321-1323, :1475).

## Minor observations
- "Auto Stop Off" reads as a status, not an action (:1439).
- Tummo card name grows to "Cyclic Hyperventilation - 3 rounds then 5 minutes integration" and wraps (:243).
- Section headers 12pt uppercase secondary (:1795-1800), small for the only grouping cue.
- Glow rings (:1730-1743) do not scale with the circle, so the halo does not breathe.
- Magpie Image (:1407) has no accessible={false}.
- Hyphen is the only timing separator, so "4-4-hold-4-4" is ambiguous (:1497-1503).
- Haptics fire on every phase, including Tummo's ~60 transitions, with no in-screen way to turn them off.
- elevation: 20 on the circle (:1749) is Android-only.
- Header reads "Breathe Easy Aviary" (:1419); PRODUCT.md says in-app name stays "Breathe Easy".

## Questions to consider
1. If the daily return is the goal, should Home open on "Start your usual session", with the 7-pattern library one tap away behind "Change pattern"?
2. If each of the seven patterns were a bird (color, card illustration, short call at session end), what would the pastels and names need to become?
3. What should a session end sound and look like if the intended use is eyes closed with the screen locked?

## Decisions (2026-10-01, user)
- Bird identity: leave for now (the P2 bird-identity issue is deferred; the backdrop stays as is).
- Scope and priority: not proceeding this round. The user will pick this up later. No priority order or scope was chosen among the three P1 issues.
- Nothing in the app was changed as a result of this critique.

## Evidence notes
- impeccable detect returned [] (exit 0); audit.native.md says the detector does not apply to native apps, so this is not evidence the screen is clean.
- tsc --noEmit: no errors in breathing-screen.tsx; only errors are missing Jest types in src/constants/__tests__/breathing-patterns.test.ts.
- Contrast ratios are the review agent's own calculations from code and tokens, not device measurements. No app was run.
- Next step when resuming: choose among the P1 issues, then run the suggested commands, ending with /impeccable polish, and re-run /impeccable critique to compare against 26/40.
