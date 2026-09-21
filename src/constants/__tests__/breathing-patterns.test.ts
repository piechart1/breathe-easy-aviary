import { BREATHING_PATTERNS, PATTERN_ACCENT_COLORS } from '../breathing-patterns';

describe('BREATHING_PATTERNS', () => {
  it('has a unique id for every pattern', () => {
    const ids = BREATHING_PATTERNS.map((pattern) => pattern.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every pattern at least one phase with a positive duration', () => {
    for (const pattern of BREATHING_PATTERNS) {
      expect(pattern.phases.length).toBeGreaterThan(0);
      for (const phase of pattern.phases) {
        expect(phase.durationMs).toBeGreaterThan(0);
      }
    }
  });

  it('has an accent color for every pattern id', () => {
    for (const pattern of BREATHING_PATTERNS) {
      expect(PATTERN_ACCENT_COLORS[pattern.id]).toBeDefined();
    }
  });
});
