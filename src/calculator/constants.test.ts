import { describe, expect, it } from 'vitest';
import { ERROR_TOKEN, HISTORY_CAP, INVALID, MAX_INPUT_DIGITS, SIG } from './constants.ts';

describe('calculator constants', () => {
  it('pins the values the ADRs specify', () => {
    expect(ERROR_TOKEN).toBe('Error');
    expect(HISTORY_CAP).toBe(50);
    expect(SIG).toBe(12);
    expect(MAX_INPUT_DIGITS).toBe(15);
    expect(typeof INVALID).toBe('symbol');
  });
});
