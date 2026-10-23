---
target: breathing screen (after Cyclic Hyperventilation count fix)
total_score: 28
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 1
target_identity: "file:/Users/DavidSlee/Breathe/src/components/breathing-screen.tsx"
target_fingerprint: "sha256:afa1732b6427adc41c31e670fd4a8ed976597ce4a25bdba168bcd402c198e242"
target_path: /Users/DavidSlee/Breathe/src/components/breathing-screen.tsx
timestamp: 2026-10-23T06-16-45Z
slug: src-components-breathing-screen-tsx
---
# Critique: Breathing screen (src/components/breathing-screen.tsx)

Method: dual-agent (A: design review sub-agent · B: detector sub-agent). Re-run after the P1 fix for Cyclic Hyperventilation (breath count "n / 30", hold time for both holds, "Round n of m"). Assessment A did not see earlier reports or diffs.

## Score: 28/40 (Good)
| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 3 | Phase, clock, active segment, round and breath count clear; Integration shows session clock not time left; recovery hold counts up |
| 2 | Match system / real world | 2 | Two different holds both labelled "Hold"; circle stays full during Integration (:1307); unexplained "1" in timing; early stop says "Session complete" |
| 3 | User control and freedom | 3 | Easy stop, confirm on Cyclic Hyperventilation (:1651-1672); guided patterns end on one tap with no undo or visible stop hint |
| 4 | Consistency and standards | 3 | Native Menu/BottomSheet/Alert; disabled hold button shown in phases where it can't act; DESIGN.md drift on hold button and label size |
| 5 | Error prevention | 3 | Confirm-on-end, Plus lookup grace (:864-877); guided sessions end on one tap |
| 6 | Recognition rather than recall | 3 | Timings on cards and under circle, last pattern restored (:985); Cyclic Hyperventilation timing needs decoding |
| 7 | Flexibility and efficiency | 3 | Open, last pattern, one tap; Auto Stop on Home; no Start from info sheet |
| 8 | Aesthetic and minimalist design | 3 | Calm, list hides in session; pale light-mode circle outweighed by bird; disabled navy button heaviest idle element |
| 9 | Error recovery | 2 | "Session complete" for finished and abandoned; <10s sessions silently discarded (:196); audio interruption unexplained |
| 10 | Help and documentation | 3 | Good info sheets and safety line; no Start in sheet; timing notation unexplained |
| **Total** | | **28/40** | **Good** |

## Design specificity
Specific to the product apart from the pattern list: per-pattern colour and bird, and a distinct Cyclic Hyperventilation session language (round label, breath counter, hold timer, navy hold button). Header and grey card list are category-generic.

Detector: target clean ([], exit 0); 5 advisory findings in animated-icon.tsx / .module.css (Expo template gradient and radius), none on this screen. Detector covers only colour/radius literals on native code. Browser overlay skipped (native). tsc: 0 errors in target; 8 in breathing-patterns.test.ts (Jest types).

## Cognitive load
3 of 8 fail (moderate): chunking (5 guided cards), visual hierarchy (light-mode bird outweighs pale circle; disabled button outweighs status; static name in Ink while live phase word in Slate), minimal choices (7 patterns; 9 Auto Stop options).

## Emotional journey
Idle calm; one-tap start; guided session steady with bold active segment. Cyclic Hyperventilation retention hold now reassuring (counting hold timer, enabled button). Slips in the recovery hold (grey "End hold" button) and Integration (circle stays full, session clock). End is the flattest moment: grey "Session complete 0:30", no Health, streak or bird.

## Strengths
1. Session mode removes the pattern list; bold active timing segment shows position.
2. Native Menu, BottomSheet and destructive Alert.
3. Care for advanced users: stray-tap confirmation, Round N of M, breath counter, tabular hold timer, VoiceOver labels on each readout.

## Priority issues
- [P1] "End hold and breathe in" shows disabled whenever Cyclic Hyperventilation is selected (showDynamicHoldButton, :927): idle, rapid breaths, recovery hold (still reads "End hold"), Integration, after the session; bird shows through it in dark mode. Fix: render only when isDynamicHoldReady, keep space with a placeholder, fade in at the retention hold. Command: distill.
- [P2] At XXXL Dynamic Type the timing line overlaps the bird (fixed 380pt bird positioned from the bottom, :534-544); slate on bird grey ~1.6:1 (calculated). Likely also at default size on SE/mini (not verified). Fix: keep bird size, clamp its top edge below the circle section via onLayout. Command: adapt.
- [P2] Integration looks like a held full breath: scale animation skipped (:1307) though targetScale is minimum (:1186); session clock instead of time left; no segment highlighted. Fix: ease to minimum, show remaining time, label "Rest"/add integration segment. Commands: clarify, animate.
- [P2] Weak light-mode selection and circle contrast (selected border ~1.2:1, fill step ~1.1:1, Box circle ~1.5:1, calculated). Fix: deeper light-mode border variant or checkmark; more saturated light circle. Command: colorize.
- [P2] No visible stop hint; early stop reported as "Session complete" (:1675-1680); "Session complete" outranks "Tap to Unlock Plus" on a locked pattern. Fix: "Session ended" for user stops, brief "Tap the circle to stop" hint, lock message takes priority. Command: clarify.

## Persona red flags
- Jordan: circle doesn't look pressable; unexplained "1"; "Advanced / Self-Paced" + "Plus" + lock unexplained; no Start in info sheet.
- Sam: XXXL overlap; lock/info symbols fixed 16-18pt; Tick style gives no phase names to VoiceOver; PRODUCT.md claims a polite live region the code no longer has.
- Casey: stray tap ends guided session; under 10s discarded silently.
- Daily-practice regular: short start path; flat end with no Health/routine/bird acknowledgement.
- Advanced practitioner: must open eyes to find End hold; two "Hold" labels; recovery hold counts up.

## Minor observations
- Static name in Ink vs live phase word in Slate at the same size.
- "Excellent go to" should be "go-to" (breathing-patterns.ts, Box and Cyclic Sighing info).
- DESIGN.md drift: hold button spec (10px, 8x24, centred) vs code (16px, 64pt, full width); label 12 vs 13px. Update the doc.
- Hold button text hardcodes #FFFFFF (:2233) though theme.textOnAccent exists.
- Skip to Hold (dev-only): round 2 hold starts with full circle.
- Fixed bird shows in gaps between cards while the list scrolls (decided style).

## Questions to consider
1. Should ending the retention hold be "tap anywhere" (circle still guarded) for eyes-closed practice?
2. In light mode the bird outweighs the pastel circle; is the circle's strength decided too?
3. What should the last ten seconds feel like for someone building a daily habit?

## Evidence notes
Simulator only (iPhone 17 Pro Max, Debug build). Screenshots in the session scratchpad (critique-a2/). Contrast calculated from tokens or sampled colours. Not verified: audio, haptics, VoiceOver, Reduce Motion (no handling in code), smaller devices, Preset retention mode, locked screen, interruptions.

## Decisions (2026-10-23, user)
- Fix the P1 (hold button only during the retention hold, fading in) and the Integration P2 (circle settles to resting size, "Rest" with time left).
- Copy fixes: "Session ended" for sessions stopped early (tap, pattern change, audio interruption), "Session complete" only for Auto Stop or a finished Cyclic Hyperventilation run; the unlock prompt takes priority over the last session's result; "go-to" typo; DESIGN.md hold-button and label specs and the screen-reader guidance updated to match the code (PRODUCT.md too).
- Bird overlap at the largest text sizes: leave as is.
- Light-mode contrast and the stop hint: not this round.
