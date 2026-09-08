import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Calculator } from './Calculator.tsx';

function displayText() {
  return screen.getByRole('group', { name: 'Display' }).textContent;
}

async function press(...labels: string[]) {
  for (const label of labels) {
    await userEvent.click(screen.getByRole('button', { name: label }));
  }
}

describe('Calculator integration', () => {
  it('computes 7 × 3 = 21', async () => {
    render(<Calculator />);
    await press('7', 'Multiply', '3', 'Equals');
    expect(displayText()).toContain('21');
  });

  it('shows the pending operation on the secondary line', async () => {
    render(<Calculator />);
    await press('1', '2', 'Add');
    expect(displayText()).toContain('12 +');
  });

  it('chains immediate execution left-to-right: 2 + 3 × 4 = 20', async () => {
    render(<Calculator />);
    await press('2', 'Add', '3', 'Multiply', '4', 'Equals');
    expect(displayText()).toContain('20');
  });

  it('groups thousands live while typing', async () => {
    render(<Calculator />);
    await press('1', '2', '3', '4', '5', '6', '7');
    expect(displayText()).toContain('1,234,567');
  });

  it('all-clear resets to 0', async () => {
    render(<Calculator />);
    await press('9', 'Add', '5', 'All clear');
    const text = displayText();
    expect(text).toContain('0');
    expect(text).not.toContain('9');
  });

  it('history lifecycle: equals adds a row, click recalls it, Clear history empties it', async () => {
    render(<Calculator />);

    await press('7', 'Multiply', '3', 'Equals');
    const recall = screen.getByRole('button', { name: 'Recall 21' });
    expect(recall).toHaveTextContent('7 × 3');

    // recall loads the result, ready for another operator
    await press('All clear');
    await userEvent.click(recall);
    await press('Add', '1', 'Equals');
    expect(displayText()).toContain('22');

    // a failed equals adds no row; the panel still holds just the two entries
    await press('All clear', '5', 'Divide', '0', 'Equals');
    expect(screen.getAllByRole('button', { name: /^Recall / })).toHaveLength(2);

    // Clear history empties the list without touching the (error) display
    await press('All clear');
    await userEvent.click(screen.getByRole('button', { name: 'Clear history' }));
    expect(screen.queryByRole('button', { name: /^Recall / })).toBeNull();
    expect(screen.getByText('No calculations yet. Press equals to add one.')).toBeInTheDocument();
  });

  it('÷ 0 shows Error, absorbs further keys, and recovers on AC', async () => {
    render(<Calculator />);
    await press('9', 'Divide', '0', 'Equals');
    expect(displayText()).toContain('Error');

    // every key is a no-op in the error state except AC
    await press('5', 'Add', 'Equals', 'Delete', 'Decimal point');
    expect(displayText()).toContain('Error');

    await press('All clear');
    const text = displayText();
    expect(text).toContain('0');
    expect(text).not.toContain('Error');
  });

  it('announces settled values in the live region and stays silent on digit entry', async () => {
    const { container } = render(<Calculator />);
    const live = container.querySelector('[aria-live="polite"]')!;
    expect(live).toHaveAttribute('aria-atomic', 'true');
    expect(live.textContent).toBe('');

    await press('7');
    expect(live.textContent).toBe(''); // digit: silent

    await press('Add');
    expect(live).toHaveTextContent('7 plus'); // operator: spoken as a word
    const afterOperator = live.textContent;

    await press('3');
    expect(live.textContent).toBe(afterOperator); // digit: node untouched, not re-fired

    await press('Equals');
    expect(live).toHaveTextContent('10'); // = : announces the result

    await press('Divide', '0', 'Equals');
    expect(live).toHaveTextContent('Error'); // error: announces
  });

  it('announces a recalled result and re-announces a repeated value', async () => {
    const { container } = render(<Calculator />);
    const live = container.querySelector('[aria-live="polite"]')!;

    await press('8', 'Multiply', '4', 'Equals'); // row: 32
    await press('9', 'Add', '9', 'Equals'); // row: 18

    // recalling a row loads its result and announces it
    await userEvent.click(screen.getByRole('button', { name: 'Recall 32' }));
    expect(live).toHaveTextContent('32');
    await press('Add', '1', 'Equals'); // operator applies to the recalled value
    expect(live).toHaveTextContent('33');

    // computing the same value again after AC still re-fires the region
    await press('All clear');
    const before = live.textContent;
    await press('8', 'Multiply', '4', 'Equals');
    expect(live).toHaveTextContent('32');
    expect(live.textContent).not.toBe(before);
  });
});
