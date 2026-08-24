export const BreathingColors = {
  saltwaterSlide: '#BCD8E1',
  anarchicVenom: '#B17DAC',
  peachFuzz: '#FFBE98',
  meadowMist: '#A8D5BA',
  oceanWhisper: '#8FC1D4',
  duskLavender: '#B8AED4',
  polarBlue: '#6FAFDB',
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
  cyclicSighing: BreathingColors.meadowMist,
  ujjayi: BreathingColors.oceanWhisper,
  buteyko: BreathingColors.duskLavender,
  tummo: BreathingColors.polarBlue,
};

const TUMMO_RAPID_BREATH_COUNT = 30;
const tummoRapidBreaths: BreathingPhase[] = Array.from({ length: TUMMO_RAPID_BREATH_COUNT }).flatMap(
  () => [
    { name: 'Inhale' as const, durationMs: 1500, targetScale: MAX_BREATH_SCALE },
    { name: 'Exhale' as const, durationMs: 1500, targetScale: MIN_BREATH_SCALE },
  ],
);

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
  {
    id: 'cyclicSighing',
    name: 'Cyclic Sighing',
    timing: '2-1-6',
    description: 'Deep inhale, short inhale, long exhale',
    info: 'Studied by Stanford researchers for its mood-boosting effects, this pattern pairs a deep nasal inhale with a short second "top-off" inhale, then one long, extended exhale through the mouth. The prolonged exhale is what drives the calming effect, engaging the parasympathetic nervous system more strongly than a single-breath pattern.',
    phases: [
      { name: 'Inhale', durationMs: 2000, targetScale: 0.85 },
      { name: 'Inhale', durationMs: 1000, targetScale: MAX_BREATH_SCALE },
      { name: 'Exhale', durationMs: 6000, targetScale: MIN_BREATH_SCALE },
    ],
  },
  {
    id: 'ujjayi',
    name: 'Ujjayi Breath',
    timing: '4-6',
    description: 'Inhale, extended exhale',
    info: 'Known as "ocean breath" for the soft rushing sound made by gently constricting the back of the throat, Ujjayi is a slow, steady technique traditionally paired with yoga movement. The slightly longer exhale encourages a calm, focused, meditative state.',
    phases: [
      { name: 'Inhale', durationMs: 4000, targetScale: MAX_BREATH_SCALE },
      { name: 'Exhale', durationMs: 6000, targetScale: MIN_BREATH_SCALE },
    ],
  },
  {
    id: 'buteyko',
    name: 'Buteyko Breathing',
    timing: '',
    description: 'Exhale, long hold, inhale 10s and repeat several times',
    info: 'A gentle, restrained technique built around light nasal breathing and a brief pause with empty lungs after each exhale. Developed to reduce chronic over-breathing, it\'s used to ease anxiety and breathlessness by gradually building tolerance to carbon dioxide. Breathe lightly throughout, the aim is to train your body to feel a mild air hunger during these exercises.\n\n1. After a relaxed exhale, hold your breath.\n2. Retain your breath for as long as comfortably possible.\n3. Once you\'ve reached the point of moderate discomfort, inhale.\n4. Breathe normally for at least 10 seconds.\n5. Repeat several times.',
    phases: [
      { name: 'Exhale', durationMs: 4000, targetScale: MIN_BREATH_SCALE },
      { name: 'Hold', durationMs: 15000, targetScale: MIN_BREATH_SCALE },
      { name: 'Inhale', durationMs: 10000, targetScale: MAX_BREATH_SCALE },
    ],
  },
  {
    id: 'tummo',
    name: 'Tummo Breathing',
    timing: '3 rounds of 30 breaths + hold + 15s recovery',
    description: 'Rapid deep breaths, retention, recovery',
    info: 'Three rounds of 30 deep, rapid breaths followed by a retention hold (whilst exhaled), then a deep recovery breath with a 15-second hold. Retention duration is deeply personal and varies by person and session - hold only as long as feels comfortable and release whenever you feel the urge to breathe. Always practice sitting or lying down, never in water, and never while driving.',
    phases: [
      ...tummoRapidBreaths,
      { name: 'Hold', durationMs: 60000, targetScale: MIN_BREATH_SCALE },
      { name: 'Inhale', durationMs: 3000, targetScale: MAX_BREATH_SCALE },
      { name: 'Hold', durationMs: 15000, targetScale: MAX_BREATH_SCALE },
    ],
  },
];
