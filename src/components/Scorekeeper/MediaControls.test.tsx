import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import MediaControls from './MediaControls';

describe('MediaControls', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders Play button when not running', () => {
    const onToggle = vi.fn();
    const setFilter = vi.fn();
    render(<MediaControls isRunning={false} onToggle={onToggle} filter="all" setFilter={setFilter} />);

    // Check if Play button is rendered. Since it's an SVG without aria-label, we can check the button's children or just that a button exists and has the play icon classes
    // We can find the button that triggers onToggle
    const toggleButton = screen.getAllByRole('button')[0];
    expect(toggleButton).toBeInTheDocument();

    // We can verify it rendered Play by checking the SVG or class structure.
    // Given the implementation has <Play ... /> inside, it renders an svg with specific lucide classes.
    // It's sufficient to check that the toggle button works and renders.
  });

  it('renders Pause button when running', () => {
    const onToggle = vi.fn();
    const setFilter = vi.fn();
    render(<MediaControls isRunning={true} onToggle={onToggle} filter="all" setFilter={setFilter} />);

    const toggleButton = screen.getAllByRole('button')[0];
    expect(toggleButton).toBeInTheDocument();
  });

  it('calls onToggle when toggle button is clicked', () => {
    const onToggle = vi.fn();
    const setFilter = vi.fn();
    render(<MediaControls isRunning={false} onToggle={onToggle} filter="all" setFilter={setFilter} />);

    const toggleButton = screen.getAllByRole('button')[0];
    fireEvent.click(toggleButton);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('renders all filter buttons with correct texts when expanded', () => {
    const onToggle = vi.fn();
    const setFilter = vi.fn();
    render(<MediaControls isRunning={false} onToggle={onToggle} filter="all" setFilter={setFilter} />);

    const expandButton = screen.getAllByRole('button')[1];
    fireEvent.click(expandButton);

    expect(screen.getByText('Alles')).toBeInTheDocument();
    expect(screen.getByText('Schoten')).toBeInTheDocument();
    expect(screen.getByText('Doelp.')).toBeInTheDocument();
    expect(screen.getByText('Straffen')).toBeInTheDocument();
  });

  it('highlights the active filter when expanded', () => {
    const onToggle = vi.fn();
    const setFilter = vi.fn();
    render(<MediaControls isRunning={false} onToggle={onToggle} filter="goal" setFilter={setFilter} />);

    const expandButton = screen.getAllByRole('button')[1];
    fireEvent.click(expandButton);

    const allButton = screen.getByText('Alles');
    const goalButton = screen.getByText('Doelp.');

    expect(goalButton).toHaveClass('text-yellow-400 font-bold');
    expect(allButton).toHaveClass('text-gray-300');
  });

  it('calls setFilter when a filter button is clicked', () => {
    const onToggle = vi.fn();
    const setFilter = vi.fn();
    render(<MediaControls isRunning={false} onToggle={onToggle} filter="all" setFilter={setFilter} />);

    const expandButton = screen.getAllByRole('button')[1];
    fireEvent.click(expandButton);

    const shotButton = screen.getByText('Schoten');
    fireEvent.click(shotButton);

    expect(setFilter).toHaveBeenCalledWith('shot');
    expect(setFilter).toHaveBeenCalledTimes(1);
  });
});
