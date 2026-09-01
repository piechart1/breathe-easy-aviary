// Shared geo projection for the About screen's community hex-map.
//
// Both scripts/generate-world-hex-grid.mjs (build-time, run manually to
// regenerate src/constants/world-hex-grid.json) and
// scripts/aggregate-community-map.mjs (runs on a schedule via
// .github/workflows/update-community-map.yml) import this so a real
// lat/long always lands on the correct hex - the grid and the aggregation
// job share one projection instead of two independently-guessed ones.
//
// Uses d3-geo + world-atlas at build/aggregation time only - the app
// itself never imports this or ships a geo library at runtime, it just
// renders the plain [x, y] points these scripts produce.

import { readFileSync } from 'node:fs';
import { geoEquirectangular, geoContains } from 'd3-geo';
import { feature } from 'topojson-client';

const require = (await import('node:module')).createRequire(import.meta.url);
const landTopology = JSON.parse(readFileSync(require.resolve('world-atlas/land-110m.json'), 'utf8'));

export const REF_WIDTH = 913;
export const REF_HEIGHT = 405;
export const HEX_RADIUS = 6.5;

// Antarctica has no users and no other landmass extends past ~-56 lat, so
// drop any polygon that's entirely south of that - otherwise fitSize
// reserves a third of the map's height for empty ice, the same crop the
// original (lost) hex-grid script evidently made given its 913x405 aspect
// ratio.
const ANTARCTICA_LATITUDE_CUTOFF = -60;

// world-atlas's whole land mass ships as one MultiPolygon (wrapped in a
// single-feature FeatureCollection) - individual polygons within it are
// disjoint landmasses, so dropping the ones entirely south of the cutoff
// removes just Antarctica, not the southern tip of any other continent.
function dropAntarctica(geometry) {
  if (geometry.type !== 'MultiPolygon') return geometry;
  const polygons = geometry.coordinates.filter((polygon) =>
    polygon.some((ring) => ring.some(([, lat]) => lat > ANTARCTICA_LATITUDE_CUTOFF)),
  );
  return { ...geometry, coordinates: polygons };
}

const rawLandFeature = feature(landTopology, landTopology.objects.land);
const rawLandGeometry = rawLandFeature.type === 'FeatureCollection' ? rawLandFeature.features[0].geometry : rawLandFeature.geometry;

export const landFeature = { type: 'Feature', properties: {}, geometry: dropAntarctica(rawLandGeometry) };

const projection = geoEquirectangular().fitSize([REF_WIDTH, REF_HEIGHT], landFeature);

// [lon, lat] -> [x, y] in the same 913x405 reference space as
// src/constants/world-hex-grid.json's `points`. Equirectangular never
// fails to project a valid lon/lat, so this only returns null for
// out-of-range input.
export function projectLonLat(lon, lat) {
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null;
  return projection([lon, lat]);
}

export function isOnLand(lon, lat) {
  return geoContains(landFeature, [lon, lat]);
}

// [x, y] -> [lon, lat]. Only used when building the grid itself, to test
// candidate hex centers against the land mask - projectLonLat above is
// this same projection's forward direction.
export function invertToLonLat(x, y) {
  return projection.invert([x, y]);
}
