export type Op = '+' | '-' | '×' | '÷';
export type Status = 'first' | 'operatorPending' | 'second' | 'result' | 'error';

export type HistoryEntry = {
  id: string;
  left: string;
  operator: Op;
  right: string;
  result: string;
};

export type State = {
  status: Status;
  display: string;
  left: number | null;
  operator: Op | null;
  history: HistoryEntry[];
};

export type Action =
  | { type: 'digit'; digit: number }
  | { type: 'decimal' }
  | { type: 'operator'; operator: Op }
  | { type: 'equals' }
  | { type: 'clear' }
  | { type: 'backspace' }
  | { type: 'recallResult'; value: string }
  | { type: 'clearHistory' };
