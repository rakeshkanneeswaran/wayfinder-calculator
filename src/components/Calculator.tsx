import { useReducer } from 'react';
import { initialState, reducer, selectPrimaryDisplay, selectSecondaryDisplay } from '../calculator';
import { Display } from './Display.tsx';
import { Keypad } from './Keypad.tsx';
import { History } from './History.tsx';

export function Calculator() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <main className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row">
      <h1 className="sr-only">Calculator</h1>
      <div className="w-80">
        <Display
          primary={selectPrimaryDisplay(state)}
          secondary={selectSecondaryDisplay(state)}
          isError={state.status === 'error'}
        />
        <Keypad dispatch={dispatch} />
      </div>
      <History />
    </main>
  );
}
