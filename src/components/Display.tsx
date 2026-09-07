type DisplayProps = {
  primary: string;
  secondary: string;
  isError: boolean;
};

export function Display({ primary, secondary, isError }: DisplayProps) {
  return (
    <div
      role="group"
      aria-label="Display"
      className="mb-3 flex min-h-20 flex-col items-end justify-end gap-1 rounded-xl bg-zinc-950 px-4 py-4"
    >
      <div className="min-h-5 text-sm text-zinc-400">{secondary}</div>
      <div
        className={`text-right text-4xl font-light break-all ${
          isError ? 'text-red-400' : 'text-white'
        }`}
      >
        {primary}
      </div>
    </div>
  );
}
