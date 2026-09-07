import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Keypad } from './Keypad.tsx';

describe('Keypad', () => {
  it('renders all 18 keys', () => {
    render(<Keypad dispatch={vi.fn()} />);
    const group = screen.getByRole('group', { name: 'Keypad' });
    expect(group.querySelectorAll('button')).toHaveLength(18);
  });

  it('dispatches a digit action', async () => {
    const dispatch = vi.fn();
    render(<Keypad dispatch={dispatch} />);
    await userEvent.click(screen.getByRole('button', { name: '7' }));
    expect(dispatch).toHaveBeenCalledWith({ type: 'digit', digit: 7 });
  });

  it('dispatches operator actions with the right glyph', async () => {
    const dispatch = vi.fn();
    render(<Keypad dispatch={dispatch} />);
    await userEvent.click(screen.getByRole('button', { name: 'Multiply' }));
    expect(dispatch).toHaveBeenCalledWith({ type: 'operator', operator: '×' });
  });

  it('dispatches equals, clear, backspace, and decimal', async () => {
    const dispatch = vi.fn();
    render(<Keypad dispatch={dispatch} />);
    await userEvent.click(screen.getByRole('button', { name: 'Equals' }));
    await userEvent.click(screen.getByRole('button', { name: 'All clear' }));
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await userEvent.click(screen.getByRole('button', { name: 'Decimal point' }));
    expect(dispatch).toHaveBeenNthCalledWith(1, { type: 'equals' });
    expect(dispatch).toHaveBeenNthCalledWith(2, { type: 'clear' });
    expect(dispatch).toHaveBeenNthCalledWith(3, { type: 'backspace' });
    expect(dispatch).toHaveBeenNthCalledWith(4, { type: 'decimal' });
  });
});
