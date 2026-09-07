import { Display } from './Display.tsx';
import { Keypad } from './Keypad.tsx';
import { History } from './History.tsx';

/**
 * Walking skeleton. State, the reducer, and real wiring arrive in the
 * "Four-function core" slice; for now this just lays out the three regions.
 */
export function Calculator() {
  return (
    <main className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row">
      <h1 className="sr-only">Calculator</h1>
      <div className="w-80">
        <Display />
        <Keypad />
      </div>
      <History />
    </main>
  );
}
