# App Store search metadata

Draft for the next version submission. Name, subtitle and keywords only change with a new app version; promotional text can be changed at any time without review.

## Starting point (25 Sep 2026)

App Store Connect, to 23 Sep: 73 impressions, 36 product page views, 16 first-time downloads. About half the people who see the listing open it, and a good share of those download, so the main gap is how often the app appears in search at all.

Rank in the Australian store, checked through Apple's search API (a close but not exact match for what the App Store app shows):

| Search | Position |
|---|---|
| breathe easy aviary | 1 |
| breathe easy | 25 (several other apps are called Breathe Easy) |
| buteyko | 9 |
| breathing, box breathing, 4-7-8 breathing, cyclic sighing, resonance breathing, breathwork, breathing exercises, breathing for sleep, anxiety breathing, tummo, ujjayi | not in the top 200 |

A new app with no ratings will struggle on broad terms like "breathing" for a while. The more specific technique names have fewer competing apps (few apps target "tummo", "ujjayi" or "cyclic sighing"), so those are where it can realistically rank first.

## How Apple uses each field

Apple's [search guidance](https://developer.apple.com/app-store/search/) says results are based on "text relevance (matches for your app's title, subtitle, keywords, and primary category)" as well as user behaviour such as downloads and ratings. The subtitle is searched, not just the keyword field.

- **Name** (30 characters) and **subtitle** (30) are the visible fields. ASO practitioners generally find they count for more than the hidden keyword field, though Apple doesn't publish the weighting.
- **Keywords** (100 characters): comma-separated, no spaces after commas. Words from the name, subtitle and keyword field are combined, so "cyclic" and "sighing" as separate keywords can match "cyclic sighing".
- Don't repeat a word already in the name or subtitle; it wastes characters.
- Don't use other apps' names or trademarks (for example "Wim Hof").
- The description is not used for search ranking.

## Proposal

**Subtitle** (28/30):

```
Box Breathing, 4-7-8 & Sleep
```

Alternative (27/30), if you'd rather lead with the less competitive term: `Box, 4-7-8 & Cyclic Sighing`

The current subtitle, "7 Breathing Techniques & More", uses its characters on "7" and "& More", which nobody searches for.

**Keywords.** Current field (97/100):

```
breathwork,box breathing,buteyko,meditation,anxiety,stress,sleep,calm,mindfulness,relax,pranayama
```

Buteyko is the one term here with few competing apps, and it's the one the app ranks for (9th). Box breathing, breathwork, meditation, mindfulness and sleep are dominated by large, highly rated apps, so they're unlikely to bring in people for some time.

Proposed (98/100), assuming the first subtitle and the new name below:

```
cyclic,sighing,resonance,coherent,buteyko,tummo,ujjayi,pranayama,anxiety,stress,calm,relax,478,hrv
```

- `breathwork` moves into the app name, so it comes out of this field. `coherent` takes its place: "coherent breathing" is another name for resonance breathing.
- Adds the technique names that currently aren't anywhere in the name, subtitle or keywords: cyclic sighing, resonance, tummo, ujjayi. These are the searches with the fewest competing apps.
- `478` catches people who type 4-7-8 without hyphens.
- Drops `box breathing` and `sleep` (they move into the subtitle, and repeating them wastes characters), and `meditation` and `mindfulness` (broad terms with a lot of competition, and the app isn't a meditation app).
- If you use the alternative subtitle, swap `cyclic,sighing` out for `box,sleep`.

**Promotional text** (167/170). Shown above the description, not used for search:

```
Seven guided breathing techniques, from Box Breathing and 4-7-8 to Cyclic Sighing, with voice cues and calm music. Sessions can log to Apple Health. Made in Melbourne.
```

## Name

Decided 7 Oct 2026: change the App Store name from "Breathe Easy Aviary" to

```
Breathe Easy Aviary Breathwork
```

That is 30 of 30 characters. It puts "breathwork" in the name, which is generally found to count for more in search than the keyword field. On 7 Oct the app was outside the top 200 for "breathwork" in the Australian store; the top three results had 620, 1,352 and 781 ratings.

This changes the App Store listing name only. The name under the icon on the home screen stays "Breathe Easy Aviary".

## After submitting

Check the positions again two to three weeks after the new version goes live, using the same searches. Swap out keywords that still aren't in the top 50 for other technique or use-case words.
