import type { Dispatch } from 'react';
import { Key, type KeyVariant } from './Key.tsx';
import type { Action as CalcAction } from '../calculator';

type KeySpec = {
  label: string;
  ariaLabel: string;
  variant: KeyVariant;
  gridClass?: string;
  action: CalcAction;
};

const LAYOUT: KeySpec[] = [
  { label: 'AC', ariaLabel: 'All clear', variant: 'util', action: { type: 'clear' } },
  { label: '⌫', ariaLabel: 'Delete', variant: 'util', action: { type: 'backspace' } },
  { label: '÷', ariaLabel: 'Divide', variant: 'op', action: { type: 'operator', operator: '÷' } },
  { label: '×', ariaLabel: 'Multiply', variant: 'op', action: { type: 'operator', operator: '×' } },

  { label: '7', ariaLabel: '7', variant: 'digit', action: { type: 'digit', digit: 7 } },
  { label: '8', ariaLabel: '8', variant: 'digit', action: { type: 'digit', digit: 8 } },
  { label: '9', ariaLabel: '9', variant: 'digit', action: { type: 'digit', digit: 9 } },
  { label: '−', ariaLabel: 'Subtract', variant: 'op', action: { type: 'operator', operator: '-' } },

  { label: '4', ariaLabel: '4', variant: 'digit', action: { type: 'digit', digit: 4 } },
  { label: '5', ariaLabel: '5', variant: 'digit', action: { type: 'digit', digit: 5 } },
  { label: '6', ariaLabel: '6', variant: 'digit', action: { type: 'digit', digit: 6 } },
  { label: '+', ariaLabel: 'Add', variant: 'op', action: { type: 'operator', operator: '+' } },

  { label: '1', ariaLabel: '1', variant: 'digit', action: { type: 'digit', digit: 1 } },
  { label: '2', ariaLabel: '2', variant: 'digit', action: { type: 'digit', digit: 2 } },
  { label: '3', ariaLabel: '3', variant: 'digit', action: { type: 'digit', digit: 3 } },
  {
    label: '=',
    ariaLabel: 'Equals',
    variant: 'eq',
    gridClass: 'row-span-2',
    action: { type: 'equals' },
  },

  {
    label: '0',
    ariaLabel: '0',
    variant: 'digit',
    gridClass: 'col-span-2',
    action: { type: 'digit', digit: 0 },
  },
  { label: '.', ariaLabel: 'Decimal point', variant: 'digit', action: { type: 'decimal' } },
];

type KeypadProps = {
  dispatch: Dispatch<CalcAction>;
};

export function Keypad({ dispatch }: KeypadProps) {
  return (
    <div role="group" aria-label="Keypad" className="grid grid-cols-4 gap-2">
      {LAYOUT.map((k) => (
        <Key
          key={k.label}
          label={k.label}
          ariaLabel={k.ariaLabel}
          variant={k.variant}
          gridClass={k.gridClass}
          onPress={() => dispatch(k.action)}
        />
      ))}
    </div>
  );
}
