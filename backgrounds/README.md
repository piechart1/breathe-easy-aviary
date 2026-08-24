# Transparent background art — magpie, emu, possum

For use as low-opacity background imagery behind text in the iOS app.

## Files

Per animal (`magpie`, `emu`, `possum`):

| File | What it is |
| --- | --- |
| `<name>.svg` | Vector, transparent background, `viewBox 0 0 100 100` |
| `<name>-1600.png` | Full-colour raster, 1600×1600, alpha channel |
| `<name>-mono.svg` / `<name>-mono-1600.png` | Same shapes flattened to `#111111` — tint to any single colour |

No disc, no field colour, no shadow — just the animal on transparency.

## Usage

Set opacity at the view layer, not in the asset, so it can be tuned per surface:

```swift
Image("magpie")
    .resizable()
    .scaledToFit()
    .frame(width: 320)
    .opacity(0.12)                 // 0.10–0.14 on light, 0.14–0.18 on dark
    .offset(x: 60, y: 40)          // let it bleed off the edge
    .allowsHitTesting(false)
```

To tint the mono asset to a brand colour:

```swift
Image("magpie-mono")
    .renderingMode(.template)
    .foregroundStyle(Color("Blush"))
    .opacity(0.14)
```

## Legibility guidance

- Keep the art **under 18% opacity** behind body copy; below 12% behind small or secondary text.
- Scale it large and crop it off the screen edge — a big partial shape reads as texture; a small whole animal competes with the text.
- Avoid placing it directly under a text block's first two lines; anchor it to a corner.
- Prefer the mono version when the surface is coloured — the full-colour art's black masses can eat contrast at higher opacities.
- SVG is the source: re-render at other sizes rather than upscaling the PNGs. Ship `@2x`/`@3x` from the 1600 master (e.g. 320/640/960 for a 320pt frame).
