import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { History } from './History.tsx';
import type { HistoryRow } from '../calculator';

const rows: HistoryRow[] = [
  { id: 'b', expr: '9 + 9', resultDisp: '18', resultRaw: '18' },
  { id: 'a', expr: '1,234,567 × 2', resultDisp: '2,469,134', resultRaw: '2469134' },
];

describe('History', () => {
  it('shows the empty state and disables Clear history when there are no rows', () => {
    render(<History rows={[]} onRecall={vi.fn()} onClear={vi.fn()} />);
    expect(screen.getByText('No calculations yet. Press equals to add one.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear history' })).toBeDisabled();
  });

  it('renders each row as a two-line recall button, newest first', () => {
    render(<History rows={rows} onRecall={vi.fn()} onClear={vi.fn()} />);
    const recalls = screen.getAllByRole('button', { name: /^Recall / });
    expect(recalls.map((b) => b.getAttribute('aria-label'))).toEqual([
      'Recall 18',
      'Recall 2,469,134',
    ]);
    expect(recalls[0]).toHaveTextContent('9 + 9');
    expect(recalls[0]).toHaveTextContent('= 18');
  });

  it('recalls the raw (ungrouped) result string', async () => {
    const onRecall = vi.fn();
    render(<History rows={rows} onRecall={onRecall} onClear={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Recall 2,469,134' }));
    expect(onRecall).toHaveBeenCalledWith('2469134');
  });

  it('clears via the header control when rows exist', async () => {
    const onClear = vi.fn();
    render(<History rows={rows} onRecall={vi.fn()} onClear={onClear} />);
    const clear = screen.getByRole('button', { name: 'Clear history' });
    expect(clear).toBeEnabled();
    await userEvent.click(clear);
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
