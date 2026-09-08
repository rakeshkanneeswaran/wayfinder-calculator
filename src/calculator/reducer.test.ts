import { afterEach, describe, it, expect, vi } from 'vitest';
import { initialState, reducer } from './reducer';
import type { Action, Op, State } from './types';

const d = (digit: number): Action => ({ type: 'digit', digit });
const dot: Action = { type: 'decimal' };
const op = (operator: Op): Action => ({ type: 'operator', operator });
const eq: Action = { type: 'equals' };
const ac: Action = { type: 'clear' };
const bs: Action = { type: 'backspace' };

function run(actions: Action[], from: State = initialState): State {
  return actions.reduce(reducer, from);
}

describe('digit entry buffer rules', () => {
  it('leading 0 replaced by first non-zero digit', () => {
    expect(run([d(5)]).display).toBe('5');
  });

  it('repeated 0 stays 0', () => {
    expect(run([d(0), d(0), d(0)]).display).toBe('0');
  });

  it('0 then 5 gives 5 (no leading zeros)', () => {
    expect(run([d(0), d(5)]).display).toBe('5');
  });

  it('appends subsequent digits', () => {
    expect(run([d(1), d(2), d(3)]).display).toBe('123');
  });

  it('. on fresh entry gives 0.', () => {
    expect(run([dot]).display).toBe('0.');
  });

  it('. after an operator starts the right operand at 0.', () => {
    const s = run([d(7), op('+'), dot]);
    expect(s.display).toBe('0.');
    expect(s.status).toBe('second');
  });

  it('. after a result starts a fresh 0.', () => {
    const s = run([d(7), op('+'), d(3), eq, dot]);
    expect(s.display).toBe('0.');
    expect(s.status).toBe('first');
    expect(s.left).toBeNull();
  });

  it('second . in one number is ignored', () => {
    expect(run([d(1), dot, d(5), dot, d(2)]).display).toBe('1.52');
  });

  it('caps input at 15 significant digits (16th ignored)', () => {
    const sixteen = [1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3, 4, 5, 6, 7].map(d);
    expect(run(sixteen).display).toBe('123456789123456');
  });
});

describe('immediate execution (no precedence)', () => {
  it('7 × 3 = shows 21', () => {
    expect(run([d(7), op('×'), d(3), eq]).display).toBe('21');
  });

  it('2 + 3 × 4 = shows 20 (left-to-right)', () => {
    expect(run([d(2), op('+'), d(3), op('×'), d(4), eq]).display).toBe('20');
  });

  it('interim operator evaluation does not push history', () => {
    const s = run([d(2), op('+'), d(3), op('×')]);
    expect(s.display).toBe('5');
    expect(s.history).toHaveLength(0);
    expect(s.status).toBe('operatorPending');
  });

  it('0.1 + 0.2 = shows 0.3', () => {
    expect(run([d(0), dot, d(1), op('+'), d(0), dot, d(2), eq]).display).toBe('0.3');
  });
});

describe('operator behaviour', () => {
  it('replaces pending operator when pressed twice', () => {
    const s = run([d(7), op('+'), op('×')]);
    expect(s.operator).toBe('×');
    expect(s.left).toBe(7);
    expect(s.status).toBe('operatorPending');
  });

  it('operator after result chains from that result', () => {
    const s = run([d(7), op('×'), d(3), eq, op('+'), d(1), eq]);
    expect(s.display).toBe('22');
  });

  it('digit after result starts fresh', () => {
    const s = run([d(7), op('×'), d(3), eq, d(5)]);
    expect(s.display).toBe('5');
    expect(s.status).toBe('first');
    expect(s.left).toBeNull();
  });
});

describe('equals behaviour', () => {
  it('repeated = is a no-op', () => {
    const once = run([d(7), op('×'), d(3), eq]);
    const twice = reducer(once, eq);
    expect(twice).toEqual(once);
  });

  it('= with nothing pending is a no-op', () => {
    const s = run([d(7)]);
    expect(reducer(s, eq)).toEqual(s);
  });

  it('pushes exactly one history entry per completed calculation', () => {
    const s = run([d(7), op('×'), d(3), eq]);
    expect(s.history).toHaveLength(1);
    expect(s.history[0]).toMatchObject({
      left: '7',
      operator: '×',
      right: '3',
      result: '21',
    });
  });

  it('normalises the right operand through format() in the history entry', () => {
    const s = run([d(8), op('÷'), d(2), dot, d(0), d(0), eq]);
    expect(s.history[0]).toMatchObject({
      left: '8',
      operator: '÷',
      right: '2',
      result: '4',
    });
  });
});

describe('history entry id generation', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('falls back to a non-crypto id when crypto.randomUUID is unavailable', () => {
    vi.stubGlobal('crypto', {});
    const s = run([d(7), op('×'), d(3), eq]);
    expect(s.history[0]?.id).toMatch(/^id-/);
  });
});

describe('error state', () => {
  it('÷0 produces error', () => {
    const s = run([d(9), op('÷'), d(0), eq]);
    expect(s.status).toBe('error');
    expect(s.display).toBe('Error');
  });

  it('an interim operator on an invalid result also errors', () => {
    const s = run([d(9), op('÷'), d(0), op('+')]);
    expect(s.status).toBe('error');
    expect(s.display).toBe('Error');
  });

  it('0 ÷ 0 produces error', () => {
    const s = run([d(0), op('÷'), d(0), eq]);
    expect(s.status).toBe('error');
  });

  it('failed = pushes no history entry', () => {
    const s = run([d(9), op('÷'), d(0), eq]);
    expect(s.history).toHaveLength(0);
  });

  it('error absorbs all keys except clear', () => {
    const err = run([d(9), op('÷'), d(0), eq]);
    expect(reducer(err, d(5))).toEqual(err);
    expect(reducer(err, dot)).toEqual(err);
    expect(reducer(err, op('+'))).toEqual(err);
    expect(reducer(err, eq)).toEqual(err);
    expect(reducer(err, bs)).toEqual(err);
  });

  it('clear recovers from error', () => {
    const err = run([d(9), op('÷'), d(0), eq]);
    const s = reducer(err, ac);
    expect(s.status).toBe('first');
    expect(s.display).toBe('0');
  });
});

describe('all-clear', () => {
  it('resets display / operand / operator, preserves history', () => {
    const s = run([d(7), op('×'), d(3), eq, d(9), op('+'), d(2)]);
    const cleared = reducer(s, ac);
    expect(cleared).toMatchObject({
      status: 'first',
      display: '0',
      left: null,
      operator: null,
    });
    expect(cleared.history).toHaveLength(1);
  });
});

describe('backspace', () => {
  it('trims last char in first', () => {
    expect(run([d(1), d(2), d(3), bs]).display).toBe('12');
  });

  it('trims to 0 when buffer would be empty', () => {
    expect(run([d(5), bs]).display).toBe('0');
  });

  it('trims last char in second', () => {
    expect(run([d(7), op('+'), d(4), d(2), bs]).display).toBe('4');
  });

  it('is a no-op in operatorPending', () => {
    const s = run([d(7), op('+')]);
    expect(reducer(s, bs)).toEqual(s);
  });

  it('is a no-op in result', () => {
    const s = run([d(7), op('+'), d(3), eq]);
    expect(reducer(s, bs)).toEqual(s);
  });
});

describe('recallResult', () => {
  it('sets result state from any state including error', () => {
    const err = run([d(9), op('÷'), d(0), eq]);
    const s = reducer(err, { type: 'recallResult', value: '42' });
    expect(s).toMatchObject({
      status: 'result',
      display: '42',
      left: null,
      operator: null,
    });
  });

  it('leaves history untouched', () => {
    const withHistory = run([d(7), op('×'), d(3), eq]);
    const s = reducer(withHistory, { type: 'recallResult', value: '99' });
    expect(s.history).toHaveLength(1);
  });
});

describe('clearHistory', () => {
  it('empties history, touches nothing else', () => {
    const s = run([d(7), op('×'), d(3), eq]);
    const cleared = reducer(s, { type: 'clearHistory' });
    expect(cleared.history).toHaveLength(0);
    expect(cleared.display).toBe('21');
    expect(cleared.status).toBe('result');
  });
});
