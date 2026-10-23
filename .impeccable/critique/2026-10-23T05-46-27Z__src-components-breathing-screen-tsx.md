---
target: breathing screen (after 1.0.2 fixes)
total_score: 26
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 1
target_identity: "file:/Users/DavidSlee/Breathe/src/components/breathing-screen.tsx"
target_fingerprint: "sha256:80784bd8d9123b958ab295520b3c89a4768cfb27e446f968996ac96f66b9ef74"
target_path: /Users/DavidSlee/Breathe/src/components/breathing-screen.tsx
timestamp: 2026-10-23T05-46-27Z
slug: src-components-breathing-screen-tsx
---
# Critique: Breathing screen (src/components/breathing-screen.tsx)

Method: dual-agent (A: design review sub-agent · B: detector sub-agent). Re-run after the 1.0.2 changes (commits 8476821, 2e8499e, f8ff689). Assessment A did not see the 2026-10-01 report.

## Score: 26/40 (Acceptable)
| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 3 | No x/30 breath or round count in Cyclic Hyperventilation; during the hold the large figure is total session time, hold time is in the line below (:1789-1796, :1812-1815); no time remaining under Auto Stop |
| 2 | Match system / real world | 2 | Encoded timing strings ("30 breaths · hold · 1 · 15", "4 · 4 · 15 · 4 · 4 \| Inhale, exhale, ..."), "Advanced / Self-Paced" |
| 3 | User control and freedom | 3 | One tap starts and stops; Cyclic Hyperventilation confirms; other patterns end and log at once on any circle tap (:1643-1645), no resume |
| 4 | Consistency and standards | 2 | Stop confirmation only on one pattern; Auto Stop pill hidden for Cyclic Hyperventilation shifts the circle ~50pt (:1708); smallBold is weight 500 (themed-text.tsx:42) |
| 5 | Error prevention | 3 | Hold confirmation, 10s minimum, paywall check before start; stray tap still ends guided sessions |
| 6 | Recognition rather than recall | 3 | Pattern name under circle, timing always visible; selected card hard to see on pale patterns (border ~1.24:1, calculated) |
| 7 | Flexibility and efficiency | 3 | Last pattern restored (:974-980); Auto Stop from Home; no further accelerators |
| 8 | Aesthetic and minimalist design | 2 | Disabled full-width "End hold and breathe in" button visible at idle and through rapid breathing; running-state bird competes with circle; cards repeat timing |
| 9 | Error recovery | 2 | Audio failures console-only (:1495-1522); audio-focus loss ends silently and shows "Session complete" like a finished session (:465-481, :1124-1129) |
| 10 | Help and documentation | 3 | Info sheet per pattern; safety warning mid-paragraph; hold button unexplained before the hold |
| **Total** | | **26/40** | **Acceptable** |

## Design specificity
Partly specific. Per-pattern colour and per-pattern bird are product-owned; the layout (title, pill, pulsing circle, card stack with info icons) is the category template. Bird weight swings: hidden behind cards at idle, about half the screen once the list hides during a session.

Detector: `impeccable detect` on the target returned [] (exit 0). On src/components, 5 advisory findings (design-system-color x4, design-system-radius x1), all in animated-icon.tsx / animated-icon.module.css (Expo template leftovers, web variant), none on this screen. Per audit.native.md the detector does not cover VoiceOver, Dynamic Type, touch targets, Reduce Motion, contrast or safe areas on native code, so a clean scan is not evidence on those. Browser overlay skipped (native target). tsc: no errors in the target; 8 errors in breathing-patterns.test.ts (missing Jest types).

## Cognitive load
3 of 8 fail (moderate; was 5 of 8 on 2026-10-01). Fail: chunking (5 guided cards, dense), visual hierarchy (on Cyclic Hyperventilation the disabled button is the strongest element after the circle; Box circle 1.49:1 on white, calculated), minimal choices (7 cards + 7 info buttons; Auto Stop menu 9 options). Pass: single focus (caveat: running bird), grouping, one thing at a time, working memory (mostly), progressive disclosure.

## Emotional journey
- Start: quick for a returning user (last pattern preselected, one tap). Cyclic Hyperventilation opens on a large disabled navy button.
- During: guided patterns are the strongest part (circle, phase word, bold active segment); large magpie draws the eye. Rapid phase flips every 1.5s with no count.
- Peak (retention hold): button becomes active; "Hold 1:41" (total) and "10" (hold) compete, larger one is the wrong one.
- End: "Session complete 1:00" in grey and a success haptic; no Health confirmation, bird or day's practice; ending early mid-hold shows the same message.

## Strengths
1. Focus during a session: pattern list removed while running (:1847-1850); bold active timing segment (:1811-1825).
2. Safety-relevant care: confirmation before ending Cyclic Hyperventilation (:1633-1659), sub-10s taps not logged, locks not drawn until Plus status is known (:859-872), start/end announcements only (:1554-1557).
3. Native controls: SwiftUI Menu for Auto Stop, system bottom sheet for info, native destructive alert; 44pt targets via hitSlop/padding.

## Priority issues
- [P1] Cyclic Hyperventilation hold and rapid phase show the wrong number or none. Hold seconds are a segment in the timing line while the large figure is total time; no x/30 count; no round indicator. Fix: hold seconds beside the phase word, total time secondary; "12 / 30" in the rapid phase; "Round 1 of 3"; optionally last hold time at session end. Command: clarify.
- [P2] Disabled "End hold and breathe in" button is always visible on Cyclic Hyperventilation (:1830-1845, :2195-2204); near-invisible label in dark mode; ~2.3:1 in light (calculated). Fix: reserve space, show only from the hold onward (fade in, haptic), or a one-line hint at idle. Command: distill.
- [P2] Circle is the only stop control and stopping guided patterns is instant; "Stop" label is VoiceOver-only (:1757-1763). Fix: brief visible "Tap to stop"; confirm after ~30s for every pattern, or a short Resume window. Command: harden.
- [P2] Bird backdrop weight swings: 50% opacity, 380pt (pattern-birds.ts:20) fills the lower half while running; hidden behind cards at idle. Fix: lower opacity or scale while running; show or name the bird at idle. Commands: quieter, then delight.
- [P2] Pale patterns weaken the main control and the selected state (Box circle 1.49:1, selected border 1.24:1, calculated). Fix: checkmark or accent on selected card; deeper core for the three palest circles in light mode. Command: colorize.

## Persona red flags
- Sam (accessibility): no Reduce Motion handling anywhere in src; possible XXXL Dynamic Type clipping ("Cyclic Hyperventi...", "Session comp 2:0") seen after a live size change, unconfirmed on a fresh launch; hard-coded 18/14pt text; selected state near-invisible on pale patterns; info sheet Close ~3.3:1 (approximate).
- Casey (distracted mobile): circle shifts ~50pt between patterns; interruption ends the session silently and shows "Session complete".
- Jordan (first-timer): encoded timings; unexplained disabled button; safety guidance only inside the info sheet; "Tap to begin" is the only cue the circle is a button.
- Mel (daily-practice regular, eyes closed): one-tap start is excellent; a stray tap ends the session; end state does not connect to Health, streak or total; no remaining time under Auto Stop.
- Tom (Cyclic Hyperventilation / Buteyko practitioner): no breath count; large hold number is total time; hold mode not shown on the card; no hold time at the end.

## Minor observations
- smallBold is weight 500; pattern names differ from descriptions only by colour.
- Cyclic Hyperventilation card wraps to three lines with an orphaned "hold".
- "|" and "·" separators mixed in one string.
- Integration shows no countdown.
- Info sheet title is medium weight, close to body text.
- "Tap to Unlock Plus" title case vs "Tap to begin" (:1666), not seen live.
- elevation: 20 on the circle (:2158) is Android-only.
- Header repeats the app name; space could hold the bird's name or the day's practice.

## Questions to consider
1. What if the bird were part of the session rather than behind it: named on Home, shown at the end ("Practised with the kookaburra")?
2. Does Home need all seven patterns every day, given the main user repeats one?
3. For eyes-closed practice, should the screen be designed to be ignored: dim after the first breath, and make stopping a deliberate gesture?

## Evidence notes
- Simulator only (iPhone 17 Pro Max, Debug build, Force Plus on). Screenshots in the session scratchpad (critique-a/), not kept in the repo.
- Contrast ratios are calculated from tokens, not measured.
- Not verified: locked/paywall states, audio, haptics, locked-screen behaviour, interruption path, Integration and multi-round runs, VoiceOver output, XXXL clipping on a fresh launch, real hardware.

## Decisions (2026-10-23, user)
- Priority and scope: the P1 only (Cyclic Hyperventilation hold time, breath count and round number), then polish and re-run the critique.
- Bird: keep it large during sessions. The bird-weight P2 is declined; DESIGN.md and .impeccable/design.json were updated so they no longer call for a faint or smaller bird.
- The other P2s (always-visible disabled hold button, instant stop on guided patterns, pale-pattern contrast) are left for later.
