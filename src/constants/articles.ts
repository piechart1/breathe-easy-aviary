export type Article = {
  slug: string;
  title: string;
  summary: string;
  body: string;
};

export const ARTICLES: Article[] = [
  {
    slug: 'presence-and-relaxation',
    title: 'Presence and Relaxation',
    summary: 'Two things that make any breathing exercise work better - paying attention to now, and consciously softening the body.',
    body: 'Almost every breathing technique in this app is a physical pattern - a specific rhythm of inhale, hold, and exhale.\n\nStaying present means noticing the breath itself - the air at your nostrils, your belly rising and falling. Your attention will wander; that\'s normal and expected. The practice isn\'t staying perfectly focused, it\'s noticing when you\'ve drifted and gently returning attention to the breath, over and over. That returning is an important part of the exercise.\n\nRelaxing the body matters because tension and breath are directly linked. A clenched jaw, raised shoulders, or tight hands tend to pull you into shallow chest breathing, while a physically relaxed body makes slow diaphragmatic breathing come more naturally. Before starting any pattern, take a few seconds to consciously unclench your jaw, drop your shoulders away from your ears, and let your hands soften.\n\nCombined, these habits will complement your breathing, with your attention quietly along for the ride.',
  },
  {
    slug: 'autonomic-nervous-system',
    title: 'The Autonomic Nervous System',
    summary: 'The background system that runs your heart rate, digestion, and stress response - and how breath can influence it.',
    body: "The autonomic nervous system (ANS) is the part of your nervous system that runs the body's background processes without you having to think about them: heart rate, digestion, pupil size, how much you sweat, and much more. It has two main branches that work in balance with each other.\n\nThe sympathetic branch is your 'fight or flight' system - it ramps things up: faster heart rate, redirected blood flow to muscles, heightened alertness. The parasympathetic branch is your 'rest and digest' system - it winds things down: slower heart rate, activated digestion, a general sense of calm.\n\nNearly everything the ANS controls happens automatically, but breathing is a rare exception - it runs on autopilot most of the time, yet we can take direct control of it.\n\nA long, slow exhale like in 4-7-8 or Cyclic Sighing tends to nudge the parasympathetic system toward calm. Rapid, forceful breathing like Cyclic Hyperventilation activates the sympathetic system toward alertness and energy.",
  },
  {
    slug: 'diaphragmatic-breathing',
    title: 'Diaphragmatic Breathing',
    summary: 'A foundational technique for everyday breathing and many breathwork exercises.',
    body: 'The diaphragm is a large, dome-shaped muscle sitting just below your lungs. When you inhale, it should contract and flatten downward, drawing air deep into the lungs and pushing your belly outward. When you exhale, it relaxes back into its dome shape.\n\nMany people, especially under stress, shift instead toward shallow chest breathing - short breaths that raise the chest and shoulders while hardly engaging the diaphragm.\n\nYou can check which one you\'re doing. Lie down or sit comfortably, put one hand on your chest and one on your belly, and breathe normally. If the hand on your chest is doing most of the moving, that\'s chest breathing. If the hand on your belly rises and falls more than your chest, that\'s diaphragmatic breathing.\n\nBox Breathing, 4-7-8, and Resonance Breathing all work best when each inhale and exhale is diaphragmatic rather than shallow.',
  },
  {
    slug: 'air-hunger',
    title: 'Air Hunger',
    summary: 'The mild, controlled urge to breathe that Buteyko Breathing cultivates.',
    body: 'Air hunger is the felt sense that you want to breathe. It\'s driven mainly by rising carbon dioxide (CO2) in your blood, not by falling oxygen as most people assume. Your body is exquisitely sensitive to CO2, and it\'s this sensitivity, not oxygen level, that predominantly decides when you feel you need a breath.\n\nThis is the premise behind Buteyko Breathing. Many people who breathe too much, too often - chronic over-breathers - become oversensitized to CO2 over time, so their body signals air hunger and breathlessness at levels of CO2 that are actually completely normal. This oversensitivity is linked to anxiety, breathlessness, and a general feeling of never quite getting a satisfying breath.\n\nButeyko\'s light breathing and post-exhale pause are designed to gently and gradually raise your tolerance to CO2, which in turn recalibrates that oversensitive alarm system. Over time, with consistent light practice, the same CO2 level that used to trigger breathlessness stops feeling urgent at all.\n\nThe air hunger you\'re aiming for in Buteyko is a light, background pull - noticeable, even slightly uncomfortable, but never gasping, straining, or panicked. If it tips into this space, that\'s a sign to back off, breathe normally, and reduce the hold duration.',
  },
  {
    slug: 'hrv',
    title: 'Heart Rate Variability (HRV)',
    summary: 'Why the space between your heartbeats says more than your heart rate alone.',
    body: 'Your heart doesn\'t beat like a metronome. Even at a steady resting heart rate, the exact gap between one beat and the next varies slightly from beat to beat - that variation is Heart Rate Variability, or HRV.\n\nA higher HRV generally reflects a nervous system that can flexibly shift between alertness and calm as circumstances demand. A lower HRV can reflect stress, fatigue, illness, or overtraining, since it often means the body is stuck leaning on one setting rather than adapting smoothly. This is why HRV has become a popular recovery marker in fitness trackers and smartwatches.\n\nBreathing practice is one of the most direct ways to influence HRV in the moment. Slow, paced breathing - especially around 5-6 breaths per minute, close to what patterns like Resonance Breathing use - tends to increase HRV during the practice itself, and regular practice over time is associated with higher resting HRV. This happens because slow exhale-emphasized breathing engages the vagus nerve, the main channel through which your parasympathetic system talks to your heart.\n\nWorth keeping in perspective: HRV is one signal among many, it varies a lot between individuals, and a single low reading on a given day isn\'t a diagnosis of anything. It\'s useful as a trend over time, not a single number to chase.',
  },
  {
    slug: 'ujjayi-how-to',
    title: 'How to Practice Ujjayi Breath',
    summary: 'Guidance for the throat constriction that gives Ujjayi its signature ocean sound.',
    body: "Ujjayi (pronounced oo-JAI) gets its 'ocean breath' name from the soft, rushing sound it produces. Here's how to create that sound and settle into the practice.\n\nStart seated comfortably with your spine tall and shoulders relaxed, breathing through your nose with your mouth closed throughout.\n\nTo find the sound, gently constrict the back of your throat - the same subtle tightening you'd use to fog up a mirror with a 'haaa', or to whisper. Keep your mouth closed and let that same soft constriction shape the air moving through your nose on both the inhale and the exhale.\n\nThe sound should stay soft and smooth throughout, like distant ocean waves, not a hard or strained rasp.\n\nIf you lose the sound, or your throat starts to feel tight or strained, ease off the constriction and return to normal breathing for a few breaths before trying again.\n\nStart with just a minute or two of practice, building up gradually as the throat constriction becomes more natural and less effortful to hold.",
  },
  {
    slug: 'cyclic-hyperventilation',
    title: 'Cyclic Hyperventilation',
    summary: 'The physiology behind the rapid-breathing-and-hold pattern used in this practice.',
    body: 'Cyclic hyperventilation is the pattern behind this app\'s most intense breathing exercise: rounds of rapid, deep breathing followed by a breath hold, then a recovery breath. It\'s the same underlying technique popularised in recent years by methods like the Wim Hof Method, and it shares its rapid, forceful rhythm with much older breathing traditions too - from Tibetan Tummo practice to yogic pranayama techniques like Bhastrika and Kapalabhati.\n\nThe physiology is well understood. Breathing rapidly for a couple of minutes flushes carbon dioxide (CO2) out of your blood faster than your body produces it, a temporary state called hypocapnia. Because it\'s rising CO2, not falling oxygen, that normally triggers your urge to breathe, lowering it first means the hold that follows can be sustained far longer and more comfortably than a hold on a normal breath ever could. Tingling in the hands and lips, light-headedness, and a sense of warmth during the rapid-breathing phase are all normal, expected effects of this shift in blood chemistry.\n\nBecause the hold can be sustained longer than usual without the body\'s normal warning signs, this technique deserves respect: always practice sitting or lying down, never in water, and never while driving or operating machinery. Retention duration is personal and varies session to session - hold only as long as feels comfortable, and release the moment you feel the urge to breathe.',
  },
];
