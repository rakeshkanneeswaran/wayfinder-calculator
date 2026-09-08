import { describe, it, expect } from 'vitest';
import { initialState, reducer } from './reducer';
import {
  selectAnnouncement,
  selectHistoryRows,
  selectPrimaryDisplay,
  selectSecondaryDisplay,
} from './selectors';
import type { Action, Op } from './types';

const d = (digit: number): Action => ({ type: 'digit', digit });
const op = (operator: Op): Action => ({ type: 'operator', operator });
const eq: Action = { type: 'equals' };

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

  it('renders subtraction with the − glyph, not ASCII -', () => {
    expect(selectSecondaryDisplay(run([d(9), op('-')]))).toBe('9 −');
  });
});

describe('selectHistoryRows', () => {
  it('is empty when no calculation has completed', () => {
    expect(selectHistoryRows(initialState)).toEqual([]);
    expect(selectHistoryRows(run([d(7), op('+'), d(3)]))).toEqual([]);
  });

  it('projects a completed calculation into expr / resultDisp / resultRaw', () => {
    const s = run([d(7), op('÷'), d(3), eq]);
    expect(selectHistoryRows(s)).toEqual([
      {
        id: s.history[0]!.id,
        expr: '7 ÷ 3',
        resultDisp: '2.33333333333',
        resultRaw: '2.33333333333',
      },
    ]);
  });

  it('comma-groups both operands and the result', () => {
    const digits = [1, 2, 3, 4, 5, 6, 7].map(d);
    const s = run([...digits, op('×'), d(2), eq]);
    expect(selectHistoryRows(s)[0]).toMatchObject({
      expr: '1,234,567 × 2',
      resultDisp: '2,469,134',
    });
  });

  it('renders exponential strings verbatim (no grouping)', () => {
    const big = [9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9].map(d);
    const s = run([...big, op('×'), ...big, eq]);
    const row = selectHistoryRows(s)[0]!;
    expect(row.resultDisp).toMatch(/e\+/);
    expect(row.resultDisp).not.toContain(',');
    expect(row.resultRaw).toBe(row.resultDisp);
  });

  it('keeps newest-first order from the reducer', () => {
    const s = run([d(2), op('+'), d(2), eq, d(9), op('+'), d(9), eq]);
    expect(selectHistoryRows(s).map((r) => r.resultDisp)).toEqual(['18', '4']);
  });

  it('renders subtraction expressions with the − glyph, not ASCII -', () => {
    const s = run([d(9), op('-'), d(4), eq]);
    expect(selectHistoryRows(s)[0]!.expr).toBe('9 − 4');
  });
});

describe('selectAnnouncement', () => {
  it('is null before an operator is chosen', () => {
    expect(selectAnnouncement(initialState)).toBeNull();
    expect(selectAnnouncement(run([d(7)]))).toBeNull();
    expect(selectAnnouncement(run([d(7), op('+'), d(3)]))).toBeNull();
  });

  it('speaks the left operand and operator word while pending', () => {
    expect(selectAnnouncement(run([...[1, 2, 3, 4].map(d), op('×')]))).toBe('1,234 times');
    expect(selectAnnouncement(run([d(8), op('÷')]))).toBe('8 divided by');
  });

  it('speaks the grouped result after equals', () => {
    const digits = [1, 2, 3, 4, 5, 6, 7].map(d);
    expect(selectAnnouncement(run([...digits, op('×'), d(2), eq]))).toBe('2,469,134');
  });

  it('speaks "Error" in the error state', () => {
    expect(selectAnnouncement(run([d(9), op('÷'), d(0), eq]))).toBe('Error');
  });
});
