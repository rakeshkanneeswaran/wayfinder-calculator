import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App.tsx';

describe('App walking skeleton', () => {
  it('renders the calculator landmark and its three regions', () => {
    render(<App />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Calculator', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Display' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Keypad' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'History', level: 2 })).toBeInTheDocument();
  });
});
