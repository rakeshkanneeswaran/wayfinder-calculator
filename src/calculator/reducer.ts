import { ERROR_TOKEN, HISTORY_CAP, INVALID, MAX_INPUT_DIGITS } from './constants';
import { evaluate, format } from './format';
import type { Action, State } from './types';

function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export const initialState: State = {
  status: 'first',
  display: '0',
  left: null,
  operator: null,
  history: [],
};

function countSignificantDigits(s: string): number {
  return s.replace(/\D/g, '').length;
}

function appendDigit(buffer: string, digit: number): string {
  if (countSignificantDigits(buffer) >= MAX_INPUT_DIGITS) {
    return buffer;
  }
  if (buffer === '0') {
    return digit === 0 ? '0' : String(digit);
  }
  return buffer + String(digit);
}

function appendDecimal(buffer: string): string {
  return buffer.includes('.') ? buffer : buffer + '.';
}

const reset = {
  status: 'first' as const,
  display: '0',
  left: null,
  operator: null,
};

export function reducer(state: State, action: Action): State {
  const { status, display, left, operator, history } = state;

  switch (action.type) {
    case 'digit': {
      const { digit } = action;
      switch (status) {
        case 'first':
        case 'second':
          return { ...state, display: appendDigit(display, digit) };
        case 'operatorPending':
          return { ...state, status: 'second', display: appendDigit('0', digit) };
        case 'result':
          return {
            ...state,
            status: 'first',
            display: appendDigit('0', digit),
            left: null,
            operator: null,
          };
        default:
          return state;
      }
    }

    case 'decimal': {
      switch (status) {
        case 'first':
        case 'second':
          return { ...state, display: appendDecimal(display) };
        case 'operatorPending':
          return { ...state, status: 'second', display: '0.' };
        case 'result':
          return { ...state, status: 'first', display: '0.', left: null, operator: null };
        default:
          return state;
      }
    }

    case 'operator': {
      const op = action.operator;
      switch (status) {
        case 'first':
          return {
            ...state,
            status: 'operatorPending',
            left: Number(display),
            operator: op,
          };
        case 'operatorPending':
          return { ...state, operator: op };
        case 'second': {
          if (left === null || operator === null) return state;
          const result = evaluate(left, operator, Number(display));
          if (result === INVALID) {
            return { ...state, status: 'error', display: ERROR_TOKEN };
          }
          return {
            ...state,
            status: 'operatorPending',
            left: result,
            operator: op,
            display: format(result),
          };
        }
        case 'result':
          return {
            ...state,
            status: 'operatorPending',
            left: Number(display),
            operator: op,
          };
        default:
          return state;
      }
    }

    case 'equals': {
      if (status !== 'second' || left === null || operator === null) {
        return state;
      }
      const result = evaluate(left, operator, Number(display));
      if (result === INVALID) {
        return { ...state, status: 'error', display: ERROR_TOKEN };
      }
      const entry = {
        id: newId(),
        left: format(left),
        operator,
        right: format(Number(display)),
        result: format(result),
      };
      return {
        ...state,
        status: 'result',
        display: format(result),
        left: null,
        operator: null,
        history: [entry, ...history].slice(0, HISTORY_CAP),
      };
    }

    case 'clear':
      return { ...state, ...reset };

    case 'backspace': {
      if (status === 'first' || status === 'second') {
        return { ...state, display: display.slice(0, -1) || '0' };
      }
      return state;
    }

    case 'recallResult':
      return {
        ...state,
        status: 'result',
        display: action.value,
        left: null,
        operator: null,
      };

    case 'clearHistory':
      return { ...state, history: [] };

    /* v8 ignore next 2 -- Action is exhaustive; defensive default */
    default:
      return state;
  }
}
