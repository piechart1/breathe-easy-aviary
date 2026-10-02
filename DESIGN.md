---
name: Breathe Easy Aviary
description: A calm, tonal iOS breathing app where a soft glowing circle leads and a faint Australian bird watches from the corner.
colors:
  signal-blue: "#3B82F6"
  ink: "#111111"
  paper: "#FFFFFF"
  mist-card: "#F4F4F4"
  mist-selected: "#E8EAED"
  slate-text: "#6B7280"
  hairline: "#E5E7EB"
  night-ink: "#FFFFFF"
  night-paper: "#0D1117"
  night-card: "#1C212B"
  night-selected: "#252B36"
  night-text: "#8B949E"
  night-hairline: "#2A3140"
  saltwater-slide: "#BCD8E1"
  anarchic-venom: "#B17DAC"
  peach-fuzz: "#FFBE98"
  meadow-mist: "#A8D5BA"
  ocean-whisper: "#8FC1D4"
  dusk-lavender: "#B8AED4"
  ember-orange: "#FE5000"
  deep-navy: "#152A63"
typography:
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "40px"
    fontWeight: 700
    lineHeight: "44px"
  subtitle:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: "28px"
  phase:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "18px"
    fontWeight: 500
    lineHeight: "24px"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: "22px"
  small-bold:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: "20px"
  small:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: "20px"
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    letterSpacing: "0.5px"
rounded:
  button: "10px"
  card: "16px"
  modal: "20px"
  pill: "999px"
spacing:
  hairline: "2px"
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "64px"
components:
  pattern-card:
    backgroundColor: "{colors.mist-card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "16px"
  pattern-card-selected:
    backgroundColor: "{colors.mist-selected}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "16px"
  timer-pill:
    backgroundColor: "{colors.mist-card}"
    textColor: "{colors.slate-text}"
    rounded: "{rounded.pill}"
    padding: "4px 16px"
  minute-pill-selected:
    backgroundColor: "{colors.mist-selected}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "4px 16px"
  hold-button:
    backgroundColor: "{colors.deep-navy}"
    textColor: "#FFFFFF"
    rounded: "{rounded.button}"
    padding: "8px 24px"
  modal-card:
    backgroundColor: "{colors.mist-card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.modal}"
    padding: "24px"
---

# Design System: Breathe Easy Aviary

## Overview

**Creative North Star: "The Dawn Chorus"**

The screen is a quiet room at first light. A single circle swells and settles in a pastel that belongs to the pattern being practiced, and everything else holds still around it: flat, tonal cards, a system typeface, and one faint magpie in the lower corner. The personality is soft and warm. It comes from the seven pastels and the bird art, not from ornament or heavy chrome.

The system is a calm native iOS surface with a light and a dark theme. Depth comes from tonal layering, never from card shadows. The only light source is the breath circle, which glows in the active pattern's color. Typography is the platform's own, set in medium weight with a bold reserved for titles and the active timing segment.

**Key Characteristics:**
- Flat tonal layers: page, then card, then selected card, in steps of a few percent of lightness.
- One glow in the product, on the breath circle, tinted by the selected pattern.
- Seven pastel pattern colors carry the brand. System blue is a utility accent only.
- System font throughout; hierarchy comes from size and a single bold weight.
- Bird art sits behind content at low opacity and never competes with controls.
- Light and dark themes share the same structure and the same accent.

## Colors

A neutral, tonal interface (cool grays in light, blue-black in dark) with warm, low-saturation pastels that identify each breathing pattern.

### Primary
- **Signal Blue** (#3B82F6): the one interface accent, the same in both themes. Selected pattern-card border fallback, selected pill borders, modal action text, and links.

### Secondary
Pattern colors. Each pattern owns one, shown on the breath circle, its glow rings and the selected card's border.
- **Saltwater Slide** (#BCD8E1): Box breathing. Also the fallback pattern color.
- **Anarchic Venom** (#B17DAC): 4-7-8.
- **Peach Fuzz** (#FFBE98): Resonance (`simpleCalm`).
- **Meadow Mist** (#A8D5BA): Cyclic Sighing.
- **Ocean Whisper** (#8FC1D4): Ujjayi.
- **Dusk Lavender** (#B8AED4): Buteyko.
- **Ember Orange** (#FE5000): Cyclic Hyperventilation (Tummo), the one saturated, high-energy pattern color.

### Tertiary
- **Deep Navy** (#152A63): the fill of the Tummo "Tap to move to Inhale and Retention" button, a deliberate dark anchor with white text.

### Neutral
Light theme:
- **Ink** (#111111): primary text.
- **Paper** (#FFFFFF): page background.
- **Mist Card** (#F4F4F4): cards, pills, modal surface.
- **Mist Selected** (#E8EAED): selected card and selected pill fill.
- **Slate Text** (#6B7280): secondary text, icons, phase and timing text.
- **Hairline** (#E5E7EB): card borders and dividers.

Dark theme:
- **Night Ink** (#FFFFFF): primary text.
- **Night Paper** (#0D1117): page background.
- **Night Card** (#1C212B): cards, pills, modal surface.
- **Night Selected** (#252B36): selected card and selected pill fill.
- **Night Text** (#8B949E): secondary text and icons.
- **Night Hairline** (#2A3140): card borders and dividers.

### Named Rules
**The Pattern Owns The Color Rule.** The pastel on screen is always the selected pattern's. Never assign a pattern color to anything that is not that pattern, and never mix two pattern colors in one view.

**The Blue Is A Utility Rule.** Signal Blue marks interactive state (selection, links, modal actions). It is not a brand color and is never used on the breath circle or its glow.

## Typography

**Display Font:** system font (SF on iOS; `-apple-system`, Segoe UI, Roboto fallbacks on web)
**Body Font:** system font
**Label/Mono Font:** none; labels use the system font in small uppercase

**Character:** Platform-native and unadorned. The type recedes so the circle and the bird art carry the personality.

### Hierarchy
- **Title** (700, 40px, 44px line height): reserved for large screen titles.
- **Subtitle** (700, 22px, 28px): screen header ("Breathe Easy Aviary" is set in the subtitle size at medium weight and centered).
- **Phase** (500, 18px, 24px): the live phase word (Inhale, Hold, Exhale), the elapsed time (tabular figures) and the pattern timing line, all in Slate Text. The active timing segment turns bold and Ink.
- **Body** (500, 16px, 22px): default reading text.
- **Small / Small Bold** (500, 14px or 15px, 20px): pattern names and descriptions, modal body text, pill labels.
- **Label** (500, 12px, 0.5px tracking, uppercase): section headers such as "Guided Patterns" and "Advanced / Self-Paced".

### Named Rules
**The One Bold Rule.** Bold weight marks the screen title and the active timing segment. Elsewhere hierarchy comes from size and color, not weight.

## Layout

A single scrolling column on a safe-area container, with 24px horizontal padding and 24px between the main blocks (header, Auto Stop pill, circle, hold button, pattern list). The bottom safe-area edge is left to the native tab bar. Content is centered for the circle and phase text and left-aligned in the pattern list. On web, the tab bar is capped at an 800px content width; the breathing screen itself has no cap.

Spacing uses a 2, 4, 8, 16, 24, 32, 64 scale. Pattern cards stack with 16px gaps and 4px inside the card between name and description. Card padding is 16px. The breath circle sits in a 240px square wrapper (120px circle, glow rings at 180px and 240px).

Navigation is a native tab bar (`NativeTabs`) with template-rendered icons and a plain label that turns Ink when selected.

## Elevation & Depth

Flat by default. Cards, pills and modals have no shadow; separation comes from tonal steps (page, card, selected) and a 1px Hairline border on pattern cards. The one exception is the breath circle: a 30px blur glow in the pattern color at 90% opacity, plus two translucent ring layers behind it (12% and 22% opacity) that read as a halo. Modals are lifted by a 60% black backdrop, not by a shadow.

### Named Rules
**The Only Glow Rule.** Glow belongs to the breath circle. No card, button or text gets a shadow or glow.

## Shapes

Soft and rounded. Cards use 16px corners, modals 20px, buttons 10px, and pills and the circle are fully round (999px). Selection is shown by a 1px border in the accent color plus a tonal fill, never by a thicker stroke. Bird art is cropped off the screen edge and mirrored so it faces into the content.

## Components

### Breath Circle
- **Shape:** 120px circle with a 30px glow, in the selected pattern's color at 92% opacity, with two halo rings (12% and 22%).
- **Behavior:** scales between a minimum and maximum scale over each Inhale and Exhale on the native driver with an in-out ease. Hold keeps the scale. Tapping starts or stops a session.

### Pattern Card
- **Shape:** 16px corners, 1px border, 16px padding.
- **Default:** Mist Card fill, Hairline border. Name in Small Bold, timing and description in Small Slate Text.
- **Selected:** Mist Selected fill and a 1px border in the pattern's color.
- **Running:** the card dims to 55% opacity and cannot be tapped. Pressing dims it to 90%.
- **Locked (advanced patterns without Plus):** a small lock symbol and an info symbol sit in the top-right corner. Info is always present.

### Pills (Auto Stop and Minute Options)
- **Timer pill:** full-round, Mist Card fill, 4px by 16px padding, timer symbol and Slate Text label.
- **Minute pill:** full-round, 1px border (Hairline, or Signal Blue when selected), Mist Selected fill when selected.

### Hold Button
- **Style:** Deep Navy fill, white text, 10px corners, 8px by 24px padding, centered under the circle.
- **State:** 40% opacity until the dynamic hold is active, 85% when pressed.

### Modal Card
- **Style:** 20px corners, Mist Card fill, 24px padding, max width 360px, over a 60% black backdrop. Title in Small Bold at 18px, body in Small Slate Text, and a right-aligned "Close" in Signal Blue.

### Navigation
- **Style:** native tab bar on the page background. The selected indicator uses the card tone and the selected label is Ink.

### Bird Backdrop
- **Style:** a bird illustration (magpie on the main screen) at 20% opacity, mirrored, bleeding off the lower right and sitting behind the content.

## Do's and Don'ts

### Do:
- **Do** take every color from the theme tokens, and the breath circle color from the pattern's accent.
- **Do** keep depth tonal: page (#FFFFFF), card (#F4F4F4), selected (#E8EAED) in light, and the equivalent steps in dark.
- **Do** use Signal Blue (#3B82F6) for selection and actions only.
- **Do** give every control an accessibility label and keep the phase word in a polite live region.
- **Do** set elapsed time and counters in tabular figures so they do not jitter.

### Don't:
- **Don't** put shadows or glows on cards, pills, buttons or modals.
- **Don't** use a pattern color for anything that is not that pattern, or Signal Blue on the breath circle.
- **Don't** introduce a second typeface or add bold weight beyond the title and the active timing segment.
- **Don't** hardcode a one-off color in a component. The Hold Button's Deep Navy (#152A63) is a known exception and should move into the theme.
- **Don't** let bird art rise above 20% opacity or sit in front of controls.
