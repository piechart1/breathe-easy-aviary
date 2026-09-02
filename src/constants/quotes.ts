export type Quote = {
  text: string;
  author: string;
};

export const QUOTES: Quote[] = [
  {
    text: 'Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.',
    author: 'Thich Nhat Hanh',
  },
  { text: 'Breath is the king of mind.', author: 'B.K.S. Iyengar' },
  { text: 'Breathing in, I calm body and mind. Breathing out, I smile.', author: 'Thich Nhat Hanh' },
  { text: 'Wherever you are, be there totally.', author: 'Eckhart Tolle' },
  { text: 'The present moment is the only time over which we have dominion.', author: 'Thich Nhat Hanh' },
  { text: 'Nature does not hurry, yet everything is accomplished.', author: 'Lao Tzu, Tao Te Ching' },
  {
    text: 'Letting go gives us freedom, and freedom is the only condition for happiness.',
    author: 'Thich Nhat Hanh',
  },
  { text: 'The wound is the place where the light enters you.', author: 'Rumi, Masnavi' },
  { text: 'Nothing ever goes away until it has taught us what we need to know.', author: 'Pema Chödrön' },
  { text: 'You are the sky. Everything else is just weather.', author: 'Pema Chödrön' },
  { text: 'The mind is everything. What you think you become.', author: 'attributed to the Buddha, Dhammapada' },
  { text: 'Mindfulness is a way of befriending ourselves and our experience.', author: 'Jon Kabat-Zinn' },
  {
    text: 'You yourself, as much as anybody in the entire universe, deserve your love and affection.',
    author: 'attributed to the Buddha',
  },
  { text: 'Confine yourself to the present.', author: 'Marcus Aurelius, Meditations' },
  { text: 'The quieter you become, the more able you are to hear.', author: 'attributed to Zen teaching' },
  { text: 'Simplicity, patience, compassion.', author: 'Lao Tzu, Tao Te Ching' },
];

// One quote per calendar day, cycling back to the start once all 16 have
// shown - days-since-epoch rather than week-indexed, so the selection
// changes daily instead of weekly (contrast with the notifications' daily-
// nudge Wednesday rotation in notifications.ts). Shifted by the device's
// timezone offset before flooring to a day, so the changeover lands at the
// user's local midnight rather than UTC midnight.
export function todaysQuote(date: Date = new Date()): Quote {
  const localTime = date.getTime() - date.getTimezoneOffset() * 60000;
  const dayIndex = Math.floor(localTime / (24 * 60 * 60 * 1000));
  return QUOTES[dayIndex % QUOTES.length];
}
