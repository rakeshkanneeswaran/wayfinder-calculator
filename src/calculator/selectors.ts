import { format, groupThousands } from './format';
import type { State } from './types';

export function selectPrimaryDisplay(state: State): string {
  return groupThousands(state.display);
}

export function selectSecondaryDisplay(state: State): string {
  if (
    (state.status === 'operatorPending' || state.status === 'second') &&
    state.left !== null &&
    state.operator !== null
  ) {
    return `${groupThousands(format(state.left))} ${state.operator}`;
  }
  return '';
}
