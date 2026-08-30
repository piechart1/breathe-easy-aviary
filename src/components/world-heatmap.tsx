import { useMemo } from 'react';
import Svg, { Polygon, Rect } from 'react-native-svg';

import worldHexGrid from '@/constants/world-hex-grid.json';

const { refWidth, refHeight, hexRadius, points } = worldHexGrid as {
  refWidth: number;
  refHeight: number;
  hexRadius: number;
  points: [number, number][];
};

// How far a hex's fill shrinks inward from its full radius, leaving a
// visible gap between neighbours instead of a solid tiled mosaic.
const HEX_FILL_SCALE = 0.86;

const MAP_BACKGROUND_COLOR = '#EEF1FB';
const HEX_COLOR_NO_USERS = '#FFFFFF';
const HEX_COLOR_LOW_USERS = '#A59BE3'; // 1-4 users at that location
const HEX_COLOR_HIGH_USERS = '#CA344B'; // 5+ users at that location
const HIGH_USER_THRESHOLD = 5;

function colorForUserCount(count: number): string {
  if (count <= 0) return HEX_COLOR_NO_USERS;
  if (count < HIGH_USER_THRESHOLD) return HEX_COLOR_LOW_USERS;
  return HEX_COLOR_HIGH_USERS;
}

function hexPolygonPoints(cx: number, cy: number, radius: number): string {
  const vertices: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 90);
    vertices.push(`${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`);
  }
  return vertices.join(' ');
}

// Placeholder "activity" point, in the same reference coordinate space as
// the hex grid (0,0 at top-left, refWidth x refHeight) - stands in for real
// per-location user counts until this is wired to actual PostHog data.
// Melbourne, identified by eye against the rendered grid (hex coordinates
// aren't derivable from lat/long here - see the comment on
// SAMPLE_HOTSPOTS' predecessor in git history for why). Matched to the
// nearest actual grid point below rather than compared for exact equality,
// since (799, 338) was read off a screenshot, not copied from the source data.
const SAMPLE_HOTSPOT_REFERENCE_POINT: [number, number] = [799, 338];

function findNearestPointIndex([targetX, targetY]: [number, number]): number {
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

const SAMPLE_HOTSPOT_POINT_INDEX = findNearestPointIndex(SAMPLE_HOTSPOT_REFERENCE_POINT);

export function WorldHeatmap({
  width,
  counts,
}: {
  width: number;
  // Optional per-point user count, same order/length as the bundled hex
  // grid's points - pass this once real location data is wired in. Falls
  // back to a single sample hotspot for now.
  counts?: number[];
}) {
  const height = width * (refHeight / refWidth);
  const fillRadius = hexRadius * HEX_FILL_SCALE;

  const hexes = useMemo(
    () =>
      points.map(([x, y], index) => {
        const count = counts ? (counts[index] ?? 0) : index === SAMPLE_HOTSPOT_POINT_INDEX ? 1 : 0;
        return { x, y, color: colorForUserCount(count) };
      }),
    [counts],
  );

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${refWidth} ${refHeight}`}>
      <Rect x={0} y={0} width={refWidth} height={refHeight} fill={MAP_BACKGROUND_COLOR} />
      {hexes.map((hex, index) => (
        <Polygon key={index} points={hexPolygonPoints(hex.x, hex.y, fillRadius)} fill={hex.color} />
      ))}
    </Svg>
  );
}
