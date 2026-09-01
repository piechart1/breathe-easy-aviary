// Queries PostHog for city-level session activity, projects each city onto
// the About screen's hex grid (src/constants/world-hex-grid.json), and
// writes data/community-map-counts.json - which the app fetches at runtime
// over plain HTTPS (see src/components/about-screen.tsx). Runs daily via
// .github/workflows/update-community-map.yml; can also be run locally for
// testing with the same env vars set.
//
// Required env vars:
//   POSTHOG_PROJECT_ID       - numeric project ID (Project Settings page)
//   POSTHOG_PERSONAL_API_KEY - Personal API Key with query read access
//                              (github.com Settings > Personal API Keys)
// Optional:
//   POSTHOG_HOST             - defaults to PostHog's US cloud, matching the
//                              app's own default in src/lib/telemetry.ts

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { projectLonLat } from './lib/world-projection.mjs';

const POSTHOG_HOST = process.env.POSTHOG_HOST || 'https://us.i.posthog.com';
const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID;
const POSTHOG_PERSONAL_API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;

if (!POSTHOG_PROJECT_ID || !POSTHOG_PERSONAL_API_KEY) {
  console.error('Missing POSTHOG_PROJECT_ID or POSTHOG_PERSONAL_API_KEY environment variable.');
  process.exit(1);
}

const worldHexGrid = JSON.parse(
  readFileSync(fileURLToPath(new URL('../src/constants/world-hex-grid.json', import.meta.url)), 'utf8'),
);

// Only counts sessions actually completed, aggregated all-time rather than
// a rolling window - "where the community is practicing" is meant to read
// as a settled map, not a leaderboard that empties out week to week.
const HOGQL_QUERY = `
  SELECT
    properties.$geoip_city_name AS city,
    avg(toFloat(properties.$geoip_latitude)) AS lat,
    avg(toFloat(properties.$geoip_longitude)) AS lon,
    count(DISTINCT person_id) AS user_count
  FROM events
  WHERE event = 'session_completed'
    AND properties.$geoip_city_name IS NOT NULL
    AND properties.$geoip_latitude IS NOT NULL
    AND properties.$geoip_longitude IS NOT NULL
  GROUP BY city
`;

async function queryPostHog() {
  const response = await fetch(`${POSTHOG_HOST}/api/projects/${POSTHOG_PROJECT_ID}/query/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${POSTHOG_PERSONAL_API_KEY}`,
    },
    body: JSON.stringify({ query: { kind: 'HogQLQuery', query: HOGQL_QUERY } }),
  });

  if (!response.ok) {
    throw new Error(`PostHog query failed: ${response.status} ${response.statusText}\n${await response.text()}`);
  }

  const data = await response.json();
  return data.results ?? [];
}

// Mirrors findNearestPointIndex in src/components/world-heatmap.tsx -
// duplicated rather than imported, since that file pulls in React Native
// and can't be loaded by this plain Node script.
function findNearestPointIndex(points, [targetX, targetY]) {
  let nearestIndex = 0;
  let nearestDistanceSquared = Infinity;
  points.forEach(([x, y], index) => {
    const dx = x - targetX;
    const dy = y - targetY;
    const distanceSquared = dx * dx + dy * dy;
    if (distanceSquared < nearestDistanceSquared) {
      nearestDistanceSquared = distanceSquared;
      nearestIndex = index;
    }
  });
  return nearestIndex;
}

async function main() {
  const rows = await queryPostHog();
  const counts = new Array(worldHexGrid.points.length).fill(0);

  for (const [city, lat, lon, userCount] of rows) {
    const projected = projectLonLat(lon, lat);
    if (!projected) continue;
    const index = findNearestPointIndex(worldHexGrid.points, projected);
    counts[index] += userCount;
  }

  const output = { generatedAt: new Date().toISOString(), counts };
  const outputPath = fileURLToPath(new URL('../data/community-map-counts.json', import.meta.url));
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, JSON.stringify(output));

  console.log(`Queried ${rows.length} cities from PostHog, wrote counts for ${counts.filter((c) => c > 0).length} hexes to ${outputPath}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
