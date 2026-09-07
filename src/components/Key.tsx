export type KeyVariant = 'digit' | 'op' | 'util' | 'eq';

const variantClass: Record<KeyVariant, string> = {
  digit: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200',
  op: 'bg-zinc-200 text-zinc-900 hover:bg-zinc-300',
  util: 'bg-zinc-300 text-zinc-900 hover:bg-zinc-400',
  eq: 'bg-blue-600 text-white hover:bg-blue-700',
};

type KeyProps = {
  label: string;
  ariaLabel: string;
  variant: KeyVariant;
  gridClass?: string;
  onPress: () => void;
};

export function Key({ label, ariaLabel, variant, gridClass, onPress }: KeyProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onPress}
      className={`flex items-center justify-center rounded-lg py-4 text-xl font-medium transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${variantClass[variant]} ${gridClass ?? ''}`}
    >
      {label}
    </button>
  );
}
