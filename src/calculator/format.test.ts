import { describe, it, expect } from 'vitest';
import { evaluate, format, groupThousands } from './format';
import { INVALID } from './constants';

describe('evaluate', () => {
  it('performs addition', () => {
    expect(evaluate(1, '+', 2)).toBe(3);
  });

  it('performs subtraction', () => {
    expect(evaluate(5, '-', 3)).toBe(2);
  });

  it('performs multiplication', () => {
    expect(evaluate(3, '×', 4)).toBe(12);
  });

  it('performs division', () => {
    expect(evaluate(10, '÷', 2)).toBe(5);
  });

  it('returns INVALID for division by zero', () => {
    expect(evaluate(5, '÷', 0)).toBe(INVALID);
  });

  it('returns INVALID for 0 ÷ 0', () => {
    expect(evaluate(0, '÷', 0)).toBe(INVALID);
  });

  it('handles float arithmetic (0.1 + 0.2)', () => {
    const result = evaluate(0.1, '+', 0.2);
    expect(result).not.toBe(INVALID);
    expect(typeof result === 'number').toBe(true);
  });

  it('returns INVALID for overflow', () => {
    expect(evaluate(1e308, '×', 1e308)).toBe(INVALID);
  });

  it('handles underflow as valid zero', () => {
    const result = evaluate(1e-300, '÷', 1e300);
    expect(result).not.toBe(INVALID);
    expect(result).toBe(0);
  });
});

describe('format', () => {
  it('formats zero', () => {
    expect(format(0)).toBe('0');
  });

  it('formats negative zero as zero', () => {
    expect(format(-0)).toBe('0');
  });

  it('formats simple integers', () => {
    expect(format(42)).toBe('42');
  });

  it('formats decimals', () => {
    expect(format(1.5)).toBe('1.5');
  });

  it('hides float artifacts', () => {
    const result = format(0.1 + 0.2);
    expect(result).toBe('0.3');
  });

  it('trims trailing zeros', () => {
    expect(format(12.5)).toBe('12.5');
  });

  it('formats division results', () => {
    expect(format(1 / 3)).toMatch(/0\.333+/);
  });

  it('uses exponential for large numbers', () => {
    expect(format(1e12)).toBe('1e+12');
  });

  it('uses exponential for large integers with 12-sig mantissa', () => {
    expect(format(1.23456789012e19)).toBe('1.23456789012e+19');
  });

  it('handles a fixed-range value that rounds up into exponential', () => {
    expect(format(999999999999.9)).toBe('1000000000000');
  });

  it('uses exponential for very small numbers', () => {
    expect(format(1e-7)).toBe('1e-7');
  });

  it('uses fixed notation for 1e-6', () => {
    expect(format(1e-6)).toBe('0.000001');
  });

  it('handles negative numbers', () => {
    expect(format(-5.5)).toBe('-5.5');
  });
});

describe('groupThousands', () => {
  it('leaves small numbers unchanged', () => {
    expect(groupThousands('42')).toBe('42');
  });

  it('groups thousands in integers', () => {
    expect(groupThousands('1234567')).toBe('1,234,567');
  });

  it('groups thousands in decimals, preserving fraction', () => {
    expect(groupThousands('1234567.5')).toBe('1,234,567.5');
  });

  it('handles negative numbers', () => {
    expect(groupThousands('-1234567.5')).toBe('-1,234,567.5');
  });

  it('groups 12-digit number', () => {
    expect(groupThousands('123456789012')).toBe('123,456,789,012');
  });

  it('ignores scientific notation', () => {
    expect(groupThousands('1.23456789012e+19')).toBe('1.23456789012e+19');
  });

  it('no-ops on Error', () => {
    expect(groupThousands('Error')).toBe('Error');
  });

  it('preserves values without grouping', () => {
    expect(groupThousands('0.3')).toBe('0.3');
  });

  it('handles zero', () => {
    expect(groupThousands('0')).toBe('0');
  });
});
