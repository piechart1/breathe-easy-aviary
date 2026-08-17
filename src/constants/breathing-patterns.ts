export type PhaseName = 'Inhale' | 'Hold' | 'Exhale';

export type BreathingPhase = {
  name: PhaseName;
  durationMs: number;
  targetScale: number;
};

export type BreathingPattern = {
  id: string;
  name: string;
  timing: string;
  phases: BreathingPhase[];
};

export const MIN_BREATH_SCALE = 0.55;
export const MAX_BREATH_SCALE = 1;

export const BREATHING_PATTERNS: BreathingPattern[] = [
  {
    id: 'box',
    name: 'Box',
    timing: '4-4-4-4',
    phases: [
      { name: 'Inhale', durationMs: 4000, targetScale: MAX_BREATH_SCALE },
      { name: 'Hold', durationMs: 4000, targetScale: MAX_BREATH_SCALE },
      { name: 'Exhale', durationMs: 4000, targetScale: MIN_BREATH_SCALE },
      { name: 'Hold', durationMs: 4000, targetScale: MIN_BREATH_SCALE },
    ],
  },
  {
    id: 'four-seven-eight',
    name: '4-7-8',
    timing: '4-7-8',
    phases: [
      { name: 'Inhale', durationMs: 4000, targetScale: MAX_BREATH_SCALE },
      { name: 'Hold', durationMs: 7000, targetScale: MAX_BREATH_SCALE },
      { name: 'Exhale', durationMs: 8000, targetScale: MIN_BREATH_SCALE },
    ],
  },
  {
    id: 'simple-calm',
    name: 'Simple Calm',
    timing: '4-4',
    phases: [
      { name: 'Inhale', durationMs: 4000, targetScale: MAX_BREATH_SCALE },
      { name: 'Exhale', durationMs: 4000, targetScale: MIN_BREATH_SCALE },
    ],
  },
];
