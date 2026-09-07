import { describe, it, expect } from 'vitest';
import { initialState, reducer } from './reducer';
import { selectPrimaryDisplay, selectSecondaryDisplay } from './selectors';
import type { Action, Op } from './types';

const d = (digit: number): Action => ({ type: 'digit', digit });
const op = (operator: Op): Action => ({ type: 'operator', operator });

function run(actions: Action[]) {
  return actions.reduce(reducer, initialState);
}

describe('selectPrimaryDisplay', () => {
  it('groups the entry buffer live', () => {
    expect(selectPrimaryDisplay(run([1, 2, 3, 4, 5, 6, 7].map(d)))).toBe('1,234,567');
  });

  it('shows a clean 0 initially', () => {
    expect(selectPrimaryDisplay(initialState)).toBe('0');
  });

  it('groups a formatted result', () => {
    const s = run([...[1, 2, 3, 4, 5, 6, 7].map(d), op('×'), d(2), { type: 'equals' }]);
    expect(selectPrimaryDisplay(s)).toBe('2,469,134');
  });
});

describe('selectSecondaryDisplay', () => {
  it('is empty in first', () => {
    expect(selectSecondaryDisplay(run([d(7)]))).toBe('');
  });

  it('shows left operand and operator while pending', () => {
    const s = run([...[1, 2, 3, 4].map(d), op('×')]);
    expect(selectSecondaryDisplay(s)).toBe('1,234 ×');
  });

  it('persists through second operand entry', () => {
    const s = run([d(7), op('+'), d(3)]);
    expect(selectSecondaryDisplay(s)).toBe('7 +');
  });

  it('is empty after equals', () => {
    const s = run([d(7), op('+'), d(3), { type: 'equals' }]);
    expect(selectSecondaryDisplay(s)).toBe('');
  });
});
