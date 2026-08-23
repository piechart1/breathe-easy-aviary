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
  info: string;
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
    info: 'Also called square breathing, this technique uses equal counts for every phase to create a steady, balanced rhythm. It\'s used by Navy SEALs and in clinical stress management to calm the nervous system, sharpen focus, and regain composure under pressure.',
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
    info: 'Popularized by Dr. Andrew Weil and rooted in ancient pranayama practice, this pattern stretches the exhale far longer than the inhale. That extended release helps activate the parasympathetic nervous system, making it a favorite for easing anxiety and falling asleep faster.',
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
    info: 'Also known as coherent breathing, this pattern keeps inhale and exhale equal at a slow, steady pace of about 5-6 breaths per minute. That rhythm helps synchronize your heart rate variability with your breath, promoting a calm, balanced state well suited to everyday practice.',
    phases: [
      { name: 'Inhale', durationMs: 5000, targetScale: MAX_BREATH_SCALE },
      { name: 'Exhale', durationMs: 5000, targetScale: MIN_BREATH_SCALE },
    ],
  },
];
