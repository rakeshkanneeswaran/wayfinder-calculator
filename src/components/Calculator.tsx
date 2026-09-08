import { useReducer } from 'react';
import {
  initialState,
  reducer,
  selectHistoryRows,
  selectPrimaryDisplay,
  selectSecondaryDisplay,
} from '../calculator';
import { Display } from './Display.tsx';
import { Keypad } from './Keypad.tsx';
import { History } from './History.tsx';

export function Calculator() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <main className="flex w-full max-w-lg flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm min-[660px]:max-w-none min-[660px]:flex-row min-[660px]:p-4">
      <h1 className="sr-only">Calculator</h1>
      <div className="w-full min-[660px]:w-80">
        <Display
          primary={selectPrimaryDisplay(state)}
          secondary={selectSecondaryDisplay(state)}
          isError={state.status === 'error'}
        />
        <Keypad dispatch={dispatch} />
      </div>
      <History
        rows={selectHistoryRows(state)}
        onRecall={(value) => dispatch({ type: 'recallResult', value })}
        onClear={() => dispatch({ type: 'clearHistory' })}
      />
    </main>
  );
}
