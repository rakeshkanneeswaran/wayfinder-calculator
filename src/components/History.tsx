import type { HistoryRow } from '../calculator';

type HistoryProps = {
  rows: HistoryRow[];
  onRecall: (resultRaw: string) => void;
  onClear: () => void;
};

export function History({ rows, onRecall, onClear }: HistoryProps) {
  const empty = rows.length === 0;

  return (
    <section
      aria-labelledby="history-heading"
      className="flex max-h-96 min-w-0 flex-col border-zinc-200 min-[660px]:max-h-none min-[660px]:w-72 min-[660px]:border-l"
    >
      <div className="flex items-center justify-between px-3 py-3">
        <h2 id="history-heading" className="text-xs tracking-wide text-zinc-600 uppercase">
          History
        </h2>
        <button
          type="button"
          onClick={onClear}
          disabled={empty}
          className="rounded px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40"
        >
          Clear history
        </button>
      </div>

      {empty ? (
        <p className="px-3 py-7 text-center text-sm text-zinc-600">
          No calculations yet. Press equals to add one.
        </p>
      ) : (
        <ul className="overflow-y-auto min-[660px]:flex-1">
          {rows.map((row) => (
            <li key={row.id}>
              <button
                type="button"
                aria-label={`Recall ${row.resultDisp}`}
                onClick={() => onRecall(row.resultRaw)}
                className="flex w-full flex-col items-end gap-0.5 px-3 py-2 text-right hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <span className="text-xs text-zinc-600">{row.expr}</span>
                <span className="text-sm font-semibold text-zinc-900">= {row.resultDisp}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
