/**
 * Placeholder. The real History panel (rows, recall, clear, empty state,
 * responsive placement) lands with the calculation-history slice.
 */
export function History() {
  return (
    <section
      aria-labelledby="history-heading"
      className="flex w-72 flex-col border-l border-zinc-200"
    >
      <h2 id="history-heading" className="px-3 py-3 text-xs tracking-wide text-zinc-500 uppercase">
        History
      </h2>
      <p className="px-3 py-7 text-center text-sm text-zinc-500">
        No calculations yet. Press equals to add one.
      </p>
    </section>
  );
}
