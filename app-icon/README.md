# Magpie app icon — handoff for Claude Code

Files in this folder:

- `AppIcon.svg` — vector source of truth, 1024×1024, self-contained (no external fonts/assets).
- `AppIcon-1024.png` — rendered master, 1024×1024, fully opaque, no alpha, no rounded corners.

## iOS usage

Xcode 14+ only needs the single 1024 PNG:

1. In the app target's asset catalog, select `AppIcon`.
2. Drop `AppIcon-1024.png` into the "All Sizes / 1024pt" (single-size) well.
3. Confirm the icon set's "Single Size" option is on; Xcode generates every derived size.

Requirements this file already satisfies: 1024×1024, sRGB, PNG, **no alpha channel**, **square with no pre-baked corner radius** (iOS applies the squircle mask itself), no transparency, no drop shadow.

If you need to regenerate at other sizes, render `AppIcon.svg` rather than upscaling the PNG:

```sh
# any of these work
rsvg-convert -w 1024 -h 1024 AppIcon.svg -o AppIcon-1024.png
# or
qlmanage -t -s 1024 -o . AppIcon.svg
```

## Design notes

- Field: radial pink, `#e3c8d4` → `#d3b0c0` → `#bf98aa`, with soft kiln-bloom blobs (SVG turbulence) referencing the enamelled original.
- Bird: `#141110` body, `#dbe3e5` wing/beak/nape, `#e7e6e0` speckles, `#cf2b5c` eye, `#3b4a52` legs.
- The magpie is authored on a `0 0 100 100` grid and placed with `translate(144,120) scale(7.36)`, leaving ~14% margin — safe inside the iOS mask.
- A dark variant exists in the design file: keep the field at `#191517`, invert the body to `#f0e6ea` and the pale marks to `#c48ea6`.

Do not add corner rounding, padding, or a shadow to the exported PNG — iOS and the App Store handle masking.
