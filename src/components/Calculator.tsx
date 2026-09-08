import { useEffect, useReducer, useRef } from 'react';
import {
  initialState,
  reducer,
  selectAnnouncement,
  selectHistoryRows,
  selectPrimaryDisplay,
  selectSecondaryDisplay,
} from '../calculator';
import { Display } from './Display.tsx';
import { Keypad } from './Keypad.tsx';
import { History } from './History.tsx';

export function Calculator() {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Announce settled values only (operator / =, error, recall). `digit` /
  // `decimal` / `backspace` land in states where selectAnnouncement is null, so
  // they never announce. We diff against the last announcement — tracking null
  // too, so leaving and re-entering an announcing state counts as a change — and
  // write the sr-only node directly. When a value is announced, then cleared,
  // then announced again with the same string (compute 32 → AC → compute 32),
  // the node's text would be byte-identical and the polite region would stay
  // silent; a toggled trailing NBSP keeps the text node mutating so it re-fires,
  // and a screen reader still reads just the value. See ADR 7.
  const liveRef = useRef<HTMLDivElement>(null);
  const lastRef = useRef<string | null>(null);
  const flipRef = useRef(false);
  const announcement = selectAnnouncement(state);

  useEffect(() => {
    const changed = announcement !== null && announcement !== lastRef.current;
    lastRef.current = announcement;
    if (changed && liveRef.current) {
      flipRef.current = !flipRef.current;
      liveRef.current.textContent = flipRef.current ? announcement : `${announcement}\u00A0`;
    }
  }, [announcement]);

  return (
    <main className="flex w-full max-w-lg flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm min-[660px]:max-w-none min-[660px]:flex-row min-[660px]:p-4">
      <h1 className="sr-only">Calculator</h1>
      <div ref={liveRef} className="sr-only" aria-live="polite" aria-atomic="true" />
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
