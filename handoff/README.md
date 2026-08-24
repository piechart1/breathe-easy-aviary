# Mountain app icon — handoff

Three icon directions recreated as flat vector from two reference photographs.

## Contents
(PNG masters are rendered from the SVGs in `svg/` — regenerate from those after any edit.)
- `AppIcon.appiconset/` — drop-in Xcode asset catalog folder. 1024x1024 PNGs, square, opaque, no pre-rounded corners (iOS applies the mask). `Contents.json` currently points at **02**; change `filename` to swap directions.
- `svg/` — the vector masters (512 viewBox, exported at 1024). Edit these for any geometry or color change; re-export PNG at 1024 for submission.
- `../Mountain App Icons.dc.html` — the full design document: all three icons at 180/120/80/58, home-screen mock, production masters.

## The three directions
| id | name | source | notes |
|----|------|--------|-------|
| 01 | Ridge & rock summit | snowy ridge photo | diagonal composition, teal-slate sky, dark rock pyramid right |
| 02 | Wind-blown summit | symmetric peak photo | centred triangle, spindrift plume left, cool grey-blue |
| 03 | Breathe Easy | 02 + wordmark | wordmark on foreground snow; App Store / marketing only |

## Palette
- Sky (01): `#8aa4ae` → `#5d7d8a` → `#334c58`
- Sky (02): `#2b333d` → `#5a6773` → `#8f9daa`
- Snow: `#ffffff` → `#eef3f7` → `#c9d5e0`, shading `#b7c5d2`
- Rock: `#59616a` → `#2e343b`
- Ink (wordmark): `#1d2833`
- Corner radius when previewing outside iOS: 22.37% of icon width

## Type
Inter Tight, 600 weight, -0.02em tracking. Both words identical weight and casing.

## Notes for implementation
- The `svg/` files are self-contained (gradients + filters inlined) and render identically in Safari/Chrome/Xcode preview.
- 03's blur filter (`#plume`) rasterises fine at 1024; if a build pipeline flattens filters, export PNG instead of shipping SVG.
- At 58 px the 03 wordmark is illegible — use 02 for the home screen.
