import { ERROR_TOKEN, INVALID, SIG } from './constants';
import type { Op } from './types';

export function evaluate(left: number, op: Op, right: number): number | typeof INVALID {
  let n: number;
  switch (op) {
    case '+':
      n = left + right;
      break;
    case '-':
      n = left - right;
      break;
    case '×':
      n = left * right;
      break;
    case '÷':
      n = left / right;
      break;
  }
  return Number.isFinite(n) ? n : INVALID;
}

export function format(n: number): string {
  if (n === 0) return '0';

  const abs = Math.abs(n);

  if (abs >= 1e12 || abs < 1e-6) {
    // Exponential
    let s = n.toExponential(SIG - 1);
    // Strip trailing zeros in mantissa
    s = s.replace(/(\.\d*?)0+e/, '$1e').replace(/\.e/, 'e');
    return s;
  }

  // Fixed
  let s = n.toPrecision(SIG);
  if (s.includes('e')) {
    s = Number(s).toString();
  }
  // Strip trailing zeros after decimal and bare trailing dot
  s = s.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
  return s;
}

export function groupThousands(s: string): string {
  if (s === ERROR_TOKEN || s.includes('e')) {
    return s;
  }

  const dot = s.indexOf('.');
  const intPart = dot === -1 ? s : s.slice(0, dot);
  const fracPart = dot === -1 ? '' : s.slice(dot);
  const sign = intPart.startsWith('-') ? '-' : '';
  const absInt = sign ? intPart.slice(1) : intPart;
  const grouped = absInt.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return sign + grouped + fracPart;
}
