// Regenerates src/constants/world-hex-grid.json - a pointy-top hex grid
// covering the world's land, in the same 913x405 reference space that
// scripts/aggregate-community-map.mjs projects real user locations into.
//
// Run manually (not part of CI) whenever the grid needs rebuilding:
//   node scripts/generate-world-hex-grid.mjs
//
// The previous version of this file was produced by a one-off script that
// was never committed, so its exact projection was unrecoverable - this
// replaces it with a documented, reproducible one. Hex positions may shift
// slightly from the old file as a result, but the overall world silhouette
// should look the same.

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { REF_WIDTH, REF_HEIGHT, HEX_RADIUS, projectLonLat, invertToLonLat, isOnLand } from './lib/world-projection.mjs';

const OUTPUT_PATH = fileURLToPath(new URL('../src/constants/world-hex-grid.json', import.meta.url));

function pixelIsOnLand(x, y) {
  const lonLat = invertToLonLat(x, y);
  if (!lonLat) return false;
  const [lon, lat] = lonLat;
  return isOnLand(lon, lat);
}

// Pointy-top hex tiling (matches the vertex angles - 60*i - 90 degrees -
// used to draw each hex in src/components/world-heatmap.tsx).
const horizontalSpacing = Math.sqrt(3) * HEX_RADIUS;
const verticalSpacing = 1.5 * HEX_RADIUS;

const points = [];
let row = 0;
for (let y = HEX_RADIUS; y < REF_HEIGHT; y += verticalSpacing, row += 1) {
  const rowOffset = row % 2 === 0 ? 0 : horizontalSpacing / 2;
  for (let x = HEX_RADIUS + rowOffset; x < REF_WIDTH; x += horizontalSpacing) {
    if (pixelIsOnLand(x, y)) {
      points.push([Math.round(x * 100) / 100, Math.round(y * 100) / 100]);
    }
  }
}

writeFileSync(
  OUTPUT_PATH,
  JSON.stringify({ refWidth: REF_WIDTH, refHeight: REF_HEIGHT, hexRadius: HEX_RADIUS, points }),
);

console.log(`Wrote ${points.length} land hexes to ${OUTPUT_PATH}`);

// Sanity check: the shared forward projection should round-trip close to
// the same pixel for a location we can eyeball (Melbourne, Australia).
const [x, y] = projectLonLat(144.96, -37.81);
console.log(`Melbourne projects to [${x.toFixed(1)}, ${y.toFixed(1)}] (expect roughly the old sample point, ~[799, 338])`);
