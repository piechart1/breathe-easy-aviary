# App Store search metadata

Draft for the next version submission. Name, subtitle and keywords only change with a new app version; promotional text can be changed at any time without review.

## 1.0.3 proposal (23 Oct 2026)

### Where 1.0.2 got to

1.0.2 went live on 7 Oct with the name "Breathe Easy Aviary Breathwork", the subtitle "Box Breathing, 4-7-8 & Sleep" and the keyword field proposed further down this file (confirmed in App Store Connect on 23 Oct: `478,cyclic,sighing,resonance,coherent,buteyko,tummo,ujjayi,pranayama,anxiety,stress,calm,relax,hrv`).

App Store Connect, 24 Jul to 21 Oct: 432 impressions, 84 product page views, 31 first-time downloads, 2 paid subscriptions. Compared with the 25 Sep figures, impressions are up about six times, but the share of people who open the listing after seeing it fell from 49% to 19%. Sources shows most product page views come from App Store Search, then Browse, then App Referrer. Campaigns doesn't have enough data to show anything yet.

Rank in the Australian store on 21 Oct, from `check-ranks.py`:

| Search | 25 Sep | 21 Oct |
|---|---|---|
| tummo | – | 11 |
| breathe easy | 25 | 21 |
| buteyko | 9 | 23 |
| cyclic sighing | – | 95 |
| ujjayi | – | 134 |
| breathing, breathwork, box breathing, 4-7-8 breathing, resonance breathing, coherent breathing, breathing exercises, breathing for sleep, anxiety breathing | – | – |

The terms that rank are the specific technique names with few competing apps. None of the broad terms, including the ones in the subtitle and "breathwork" in the name, are in the top 200 yet. With one rating, that is expected.

### Subtitle (30/30)

```
Tummo, Buteyko & Box Breathing
```

This puts the two terms where the app is already near the top into the subtitle, which seems to count for more than the keyword field. "Box Breathing" stays because it's the technique most people know, and the first screenshot shows it. "4-7-8" and "Sleep" move out of the subtitle; neither ranked from there.

### Keywords (100/100)

```
tummo,hyperventilation,cyclic,sighing,ujjayi,resonance,coherent,478,sleep,anxiety,hold,pranayama,hrv
```

- `tummo` is also in the subtitle. Normally that wastes characters, but a custom product page can only be assigned words from the keyword field, not the name or subtitle, and the Cyclic Hyperventilation page below needs it.
- New: `hyperventilation` (with `cyclic` already there, this covers "cyclic hyperventilation") and `hold` (for "breath hold" searches).
- `sleep` moves here from the subtitle.
- Out: `buteyko` (now in the subtitle), and `stress`, `calm` and `relax`, which are broad terms the app doesn't rank for.

## Custom product page: Cyclic Hyperventilation

A second version of the listing, shown in search results to people who search for the keywords assigned to it. It can have its own screenshots, app preview and promotional text. The name, subtitle, description and icon stay the same as the default page.

Apple's rules, from [App Store Connect Help](https://developer.apple.com/help/app-store-connect/create-custom-product-pages/configure-multiple-product-page-versions):

- Keywords are picked from the latest approved version's keyword field. `tummo` is in the 1.0.2 field, so the page can be set up now; `hyperventilation` can be added once 1.0.3 is approved.
- Each keyword can be assigned to only one page, so these words stop showing the default page.
- The page needs App Review approval and has to be set to visible. Approved pages can be edited later without changing their URL.
- Up to 70 custom pages per app.

The page also has its own URL. Use it for links from the Cyclic Hyperventilation short and the Reddit post, so people who saw that video land on a page about it.

**Keywords to assign:** `tummo` now; `hyperventilation` and `hold` after 1.0.3.

**Promotional text** (159/170):

```
Cyclic Hyperventilation, also called Tummo: 30 breaths, a breath hold and a recovery breath, with voice cues that pace every breath. Part of Breathe Easy Plus.
```

It says up front that the pattern is part of Plus, so nobody downloads expecting it to be free.

**Screenshots**, in order. The first three show in search results.

| | Caption | Subcaption | Capture |
|---|---|---|---|
| 1 | 30 breaths, then you hold | Voice cues pace every breath | Session during the 30 breaths |
| 2 | Hold for as long as feels comfortable | Spoken minute markers keep time | Session during the retention hold |
| 3 | Set your rounds and holds | Up to 3 rounds, with optional integration | Settings, Cyclic Hyperventilation cards |
| 4 | Learn how it works, safely | Safety notes before you start | Cyclic Hyperventilation guide sheet |
| 5 | The physiology, in plain language | Why the hold feels easier after fast breathing | Reading, Cyclic Hyperventilation article |
| 6 | Six more ways to breathe | Five patterns are free | Pattern list |

These are rendered in `~/Remotion` the same way as the default set (see that project's README).

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

## What's New in 1.0.2

Draft for the "What's New in This Version" field (4,000 character limit; this is about 640):

```
Each breathing pattern now has its own Australian bird on the Home screen. You can meet all seven on the About page.

Also in this update:
• The app opens on the pattern you used last, and shows its name under the breath circle.
• Sessions end more gently. Auto Stop waits for the end of your exhale, the music fades out, and you see how long you practised.
• While a session runs, the pattern list steps aside so the circle has the screen to itself.
• Auto Stop is now a quick menu, and each pattern's guide opens in a sheet you can swipe away.
• A new Haptics switch in Settings.
• Better support for VoiceOver and larger text sizes.
```

## Store assets for 1.0.2

Re-captured on 7 Oct 2026 from the 1.0.2 build, because the screens changed. Rendered in `~/Remotion`:

- Six captioned screenshots: `~/Remotion/out/screenshots/Shot1-Session.png` to `Shot6-Progress.png` (1320×2868).
- App preview video: `~/Remotion/out/app-preview.mp4` (886×1920, 29 seconds).

## After submitting

Check the positions again two to three weeks after the new version goes live, using the same searches. Swap out keywords that still aren't in the top 50 for other technique or use-case words.
