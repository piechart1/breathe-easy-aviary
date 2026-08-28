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
  // Which '-'-separated segment of the pattern's `timing` label this phase
  // corresponds to, for highlighting progress through that label as the
  // pattern runs. Defaults to this phase's own index in `phases` when
  // omitted, which is correct for every pattern except Tummo (many rapid
  // breath phases all map back to its single "30 breaths" segment).
  timingSegmentIndex?: number;
  // Overrides which resonant-style voice cue plays for this specific phase,
  // for patterns with more than one phase of the same name that need
  // different cues (e.g. Cyclic Sighing's short second "top-off" inhale).
  // Keyed into RESONANT_SOUND_SOURCES in breathing-screen.tsx; defaults to
  // the phase's name (lowercased) when omitted.
  resonantSoundId?: string;
  // Additional voice-style cues layered concurrently on top of the main
  // resonantSoundId cue for this phase, rather than replacing it - e.g.
  // Tummo's first two breaths pairing their quiet tummo-inhale/tummo-exhale
  // cues with the regular breathe-in-relaxed/breathe-out-relaxed cues.
  // Each id is keyed into RESONANT_SOUND_SOURCES in breathing-screen.tsx.
  resonantOverlaySoundIds?: string[];
};

export type PatternCategory = 'guided' | 'advanced';

export type BreathingPattern = {
  id: string;
  name: string;
  timing: string;
  description: string;
  info: string;
  category: PatternCategory;
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

// This single 30-breath block, plus the hold/recovery phases that follow it
// in the Tummo pattern below, is what repeats when the whole exercise loops
// ("Repeat 3 times" in its description) - there's only one round of 30
// breaths in the data itself, clustered into thirds by the two breath-number
// sets below.
const TUMMO_RAPID_BREATH_COUNT = 30;
// Breath numbers (1-indexed) that layer the regular breathe-in-relaxed/
// breathe-out-relaxed cues on top of the quiet tummo-inhale/tummo-exhale
// ones - the first two breaths of each third of the 30.
const TUMMO_RELAXED_LAYERED_BREATH_NUMBERS = new Set([1, 2, 11, 12, 21, 22]);
// Breath numbers (1-indexed) that layer a second "in relaxed"/"out relaxed"
// cue partway through each third of the 30. Breath 26 is a "5 more" callout
// instead - see TUMMO_FIVE_MORE_BREATH_NUMBERS.
const TUMMO_MID_LAYERED_BREATH_NUMBERS = new Set([6, 7, 8, 16, 17, 18, 27, 28]);
// Breath numbers (1-indexed) whose Inhale layers a "5 more" callout instead
// of the regular mid-round cue.
const TUMMO_FIVE_MORE_BREATH_NUMBERS = new Set([26]);
// Breath numbers (1-indexed) whose Inhale layers a "keep it going" callout.
const TUMMO_KEEP_IT_GOING_BREATH_NUMBERS = new Set([14, 24]);
const tummoRapidBreaths: BreathingPhase[] = Array.from({ length: TUMMO_RAPID_BREATH_COUNT }).flatMap(
  (_, breathIndex) => {
    const breathNumber = breathIndex + 1;
    const isRelaxedLayeredBreath = TUMMO_RELAXED_LAYERED_BREATH_NUMBERS.has(breathNumber);
    const isMidLayeredBreath = TUMMO_MID_LAYERED_BREATH_NUMBERS.has(breathNumber);
    const isLastBreath = breathNumber === TUMMO_RAPID_BREATH_COUNT;
    const isFiveMoreBreath = TUMMO_FIVE_MORE_BREATH_NUMBERS.has(breathNumber);
    const isKeepItGoingBreath = TUMMO_KEEP_IT_GOING_BREATH_NUMBERS.has(breathNumber);
    const inhaleOverlays = [
      ...(isRelaxedLayeredBreath ? ['inhale'] : []),
      ...(isMidLayeredBreath ? ['inhale-top-off'] : []),
      ...(isLastBreath ? ['last-one'] : []),
      ...(isFiveMoreBreath ? ['five-more'] : []),
      ...(isKeepItGoingBreath ? ['keep-it-going'] : []),
    ];
    const exhaleOverlays = [
      ...(isRelaxedLayeredBreath ? ['exhale'] : []),
      ...(isMidLayeredBreath ? ['out-relaxed'] : []),
    ];
    return [
      {
        name: 'Inhale' as const,
        durationMs: 1499,
        targetScale: MAX_BREATH_SCALE,
        timingSegmentIndex: 0,
        resonantSoundId: 'tummo-inhale',
        ...(inhaleOverlays.length > 0 ? { resonantOverlaySoundIds: inhaleOverlays } : {}),
      },
      {
        name: 'Exhale' as const,
        durationMs: 1499,
        targetScale: MIN_BREATH_SCALE,
        timingSegmentIndex: 0,
        resonantSoundId: 'tummo-exhale',
        ...(exhaleOverlays.length > 0 ? { resonantOverlaySoundIds: exhaleOverlays } : {}),
      },
    ];
  },
);

export const BREATHING_PATTERNS: BreathingPattern[] = [
  {
    id: 'box',
    name: 'Box Breathing',
    timing: '4-4-4-4',
    description: 'Inhale, hold, exhale, hold',
    info: 'Also called square breathing, this technique uses equal counts for every phase to create a steady, balanced rhythm. It\'s used by Navy SEALs and in clinical stress management to calm the nervous system, sharpen focus, and regain composure under pressure.',
    category: 'guided',
    phases: [
      { name: 'Inhale', durationMs: 4000, targetScale: MAX_BREATH_SCALE },
      { name: 'Hold', durationMs: 4000, targetScale: MAX_BREATH_SCALE },
      { name: 'Exhale', durationMs: 4000, targetScale: MIN_BREATH_SCALE },
      { name: 'Hold', durationMs: 4000, targetScale: MIN_BREATH_SCALE, resonantSoundId: 'hold-down-intonation' },
    ],
  },
  {
    id: 'fourSevenEight',
    name: '4-7-8',
    timing: '4-7-8',
    description: 'Inhale, hold, exhale',
    info: 'Popularized by Dr. Andrew Weil and rooted in ancient pranayama practice, this pattern stretches the exhale far longer than the inhale. That extended release helps activate the parasympathetic nervous system, making it a favorite for easing anxiety and falling asleep faster.',
    category: 'guided',
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
    category: 'guided',
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
    category: 'guided',
    phases: [
      { name: 'Inhale', durationMs: 2000, targetScale: 0.85 },
      { name: 'Inhale', durationMs: 1000, targetScale: MAX_BREATH_SCALE, resonantSoundId: 'inhale-top-off' },
      { name: 'Exhale', durationMs: 6000, targetScale: MIN_BREATH_SCALE },
    ],
  },
  {
    id: 'ujjayi',
    name: 'Ujjayi Breath',
    timing: '4-6',
    description: 'Inhale, extended exhale',
    info: 'Known as "ocean breath" for the soft rushing sound made by gently constricting the back of the throat, Ujjayi is a slow, steady technique traditionally paired with yoga movement. The slightly longer exhale encourages a calm, focused, meditative state.',
    category: 'guided',
    phases: [
      { name: 'Inhale', durationMs: 4000, targetScale: MAX_BREATH_SCALE },
      { name: 'Exhale', durationMs: 6000, targetScale: MIN_BREATH_SCALE },
    ],
  },
  {
    id: 'buteyko',
    name: 'Buteyko Breathing',
    timing: '4-4-hold-4-4',
    description: 'Inhale, exhale, long hold, inhale, exhale.',
    info: 'A gentle, restrained technique built around light nasal breathing and a brief pause with empty lungs after each exhale. Developed to reduce chronic over-breathing, it\'s used to ease anxiety and breathlessness by gradually building tolerance to carbon dioxide. Breathe lightly throughout, the aim is to train your body to feel a mild air hunger during these exercises.\n\n1. After a relaxed inhale and exhale, hold your breath.\n2. Retain your breath for as long as comfortably possible.\n3. Once you\'ve reached the point of moderate discomfort, inhale.\n4. Resume normal breathing.\n5. Repeat several times.\n\nYou can update the default hold duration from the Settings page.',
    category: 'advanced',
    phases: [
      { name: 'Inhale', durationMs: 4000, targetScale: MAX_BREATH_SCALE },
      { name: 'Exhale', durationMs: 4000, targetScale: MIN_BREATH_SCALE },
      { name: 'Hold', durationMs: 15000, targetScale: MIN_BREATH_SCALE, resonantSoundId: 'hold-down-intonation' },
      { name: 'Inhale', durationMs: 4000, targetScale: MAX_BREATH_SCALE },
      { name: 'Exhale', durationMs: 4000, targetScale: MIN_BREATH_SCALE },
    ],
  },
  {
    id: 'tummo',
    name: 'Tummo Breathing',
    timing: '30 breaths-hold(exhaled)-4-15',
    description: 'Rapid deep breaths, long hold, inhale, hold. Repeat 3 times',
    info: 'Three rounds of 30 deep, rapid breaths followed by a retention hold (whilst exhaled), then a deep recovery breath with a 15-second hold. Retention duration is deeply personal and varies by person and session - hold only as long as feels comfortable and release whenever you feel the urge to breathe. Always practice sitting or lying down, never in water, and never while driving.',
    category: 'advanced',
    phases: [
      ...tummoRapidBreaths,
      { name: 'Hold', durationMs: 60000, targetScale: MIN_BREATH_SCALE, timingSegmentIndex: 1 },
      { name: 'Inhale', durationMs: 3000, targetScale: MAX_BREATH_SCALE, timingSegmentIndex: 2 },
      { name: 'Hold', durationMs: 15000, targetScale: MAX_BREATH_SCALE, timingSegmentIndex: 3 },
    ],
  },
];
