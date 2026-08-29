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

// Placeholder "activity" hotspots, in the same reference coordinate space
// as the hex grid (0,0 at top-left, refWidth x refHeight) - stands in for
// real per-location user counts until this is wired to actual PostHog data.
// Roughly: US, Western Europe, India, Southeast Asia/Australia. Scaled to
// spread across all three user-count tiers (0, 1-4, 5+) for a
// representative-looking sample.
const SAMPLE_HOTSPOTS: { x: number; y: number; weight: number; radius: number }[] = [
  { x: 190, y: 110, weight: 14, radius: 35 },
  { x: 470, y: 90, weight: 10, radius: 28 },
  { x: 650, y: 155, weight: 6, radius: 22 },
  { x: 740, y: 175, weight: 4, radius: 28 },
  { x: 800, y: 330, weight: 3, radius: 22 },
];

function sampleUserCount(x: number, y: number): number {
  let value = 0;
  for (const hotspot of SAMPLE_HOTSPOTS) {
    const dx = x - hotspot.x;
    const dy = y - hotspot.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    value += hotspot.weight * Math.exp(-(distance * distance) / (2 * hotspot.radius * hotspot.radius));
  }
  return Math.round(value);
}

export function WorldHeatmap({
  width,
  counts,
}: {
  width: number;
  // Optional per-point user count, same order/length as the bundled hex
  // grid's points - pass this once real location data is wired in. Falls
  // back to a fixed set of sample hotspots for now.
  counts?: number[];
}) {
  const height = width * (refHeight / refWidth);
  const fillRadius = hexRadius * HEX_FILL_SCALE;

  const hexes = useMemo(
    () =>
      points.map(([x, y], index) => {
        const count = counts ? (counts[index] ?? 0) : sampleUserCount(x, y);
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
