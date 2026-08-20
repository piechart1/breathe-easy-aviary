export const BreathingColors = {
  saltwaterSlide: '#BCD8E1',
  anarchicVenom: '#B17DAC',
  peachFuzz: '#FFBE98',
} as const;

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
  description: string;
  phases: BreathingPhase[];
};

export const MIN_BREATH_SCALE = 0.55;
export const MAX_BREATH_SCALE = 1;

export const PATTERN_ACCENT_COLORS: Record<string, string> = {
  box: BreathingColors.saltwaterSlide,
  fourSevenEight: BreathingColors.anarchicVenom,
  simpleCalm: BreathingColors.peachFuzz,
};

export const BREATHING_PATTERNS: BreathingPattern[] = [
  {
    id: 'box',
    name: 'Box Breathing',
    timing: '4-4-4-4',
    description: 'Inhale, hold, exhale, hold',
    phases: [
      { name: 'Inhale', durationMs: 4000, targetScale: MAX_BREATH_SCALE },
      { name: 'Hold', durationMs: 4000, targetScale: MAX_BREATH_SCALE },
      { name: 'Exhale', durationMs: 4000, targetScale: MIN_BREATH_SCALE },
      { name: 'Hold', durationMs: 4000, targetScale: MIN_BREATH_SCALE },
    ],
  },
  {
    id: 'fourSevenEight',
    name: '4-7-8',
    timing: '4-7-8',
    description: 'Inhale, hold, exhale',
    phases: [
      { name: 'Inhale', durationMs: 4000, targetScale: MAX_BREATH_SCALE },
      { name: 'Hold', durationMs: 7000, targetScale: MAX_BREATH_SCALE },
      { name: 'Exhale', durationMs: 8000, targetScale: MIN_BREATH_SCALE },
    ],
  },
  {
    id: 'simpleCalm',
    name: 'Resonance Breathing',
    timing: '5-5',
    description: 'Inhale, exhale',
    phases: [
      { name: 'Inhale', durationMs: 5000, targetScale: MAX_BREATH_SCALE },
      { name: 'Exhale', durationMs: 5000, targetScale: MIN_BREATH_SCALE },
    ],
  },
];
