import { ERROR_TOKEN } from './constants';
import { format, groupThousands } from './format';
import type { HistoryRow, Op, State } from './types';

export function selectPrimaryDisplay(state: State): string {
  return groupThousands(state.display);
}

/**
 * The operator as shown in the UI and history. `+ × ÷` are already glyphs in the
 * `Op` type; only subtraction's internal ASCII `-` swaps to the `−` minus glyph
 * (ADR 3 — the ASCII `-` is reserved for negative values).
 */
function displayOp(op: Op): string {
  return op === '-' ? '−' : op;
}

export function selectSecondaryDisplay(state: State): string {
  if (
    (state.status === 'operatorPending' || state.status === 'second') &&
    state.left !== null &&
    state.operator !== null
  ) {
    return `${groupThousands(format(state.left))} ${displayOp(state.operator)}`;
  }
  return '';
}

/** Newest-first history projected for the panel: operands and result pre-grouped. */
export function selectHistoryRows(state: State): HistoryRow[] {
  return state.history.map((e) => ({
    id: e.id,
    expr: `${groupThousands(e.left)} ${displayOp(e.operator)} ${groupThousands(e.right)}`,
    resultDisp: groupThousands(e.result),
    resultRaw: e.result,
  }));
}

const SPOKEN_OP: Record<Op, string> = {
  '+': 'plus',
  '-': 'minus',
  '×': 'times',
  '÷': 'divided by',
};

/**
 * The value string a screen reader should hear once the machine settles.
 * Non-null only for `operatorPending` / `result` / `error`; the container
 * decides when to actually announce it (ADR 7 — wired in the a11y ticket).
 */
export function selectAnnouncement(state: State): string | null {
  switch (state.status) {
    case 'operatorPending':
      if (state.left === null || state.operator === null) return null;
      return `${groupThousands(format(state.left))} ${SPOKEN_OP[state.operator]}`;
    case 'result':
      return groupThousands(state.display);
    case 'error':
      return ERROR_TOKEN;
    default:
      return null;
  }
}
