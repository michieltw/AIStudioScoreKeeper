import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ActionLog from './ActionLog';
import { GameEvent } from '../../types';

describe('ActionLog', () => {
  const defaultProps = {
    events: [],
    filter: 'all',
    onUndo: vi.fn(),
    homeTeam: 'Home Team',
    awayTeam: 'Away Team',
    homeColor: '#ff0000',
    awayColor: '#0000ff',
    labels: {
      title: 'ACTION LOG',
      undoButton: 'UNDO ACTION',
      redoButton: 'REDO ACTION'
    }
  };

  const mockEvents: GameEvent[] = [
    {
      id: 'event-1',
      type: 'goal',
      team: 'Home Team',
      time: '12:00',
      text: 'Goal by Player 1',
      x: 10,
      y: 20
    },
    {
      id: 'event-2',
      type: 'penalty',
      team: 'Away Team',
      time: '10:00',
      text: 'Slashing - Player 2',
      isHistorical: true
    },
    {
      id: 'event-3',
      type: 'shot',
      team: 'Home Team',
      time: '08:00',
      text: 'Shot on Goal',
      isUndone: true
    }
  ];

  it('renders correctly with empty events and custom labels', () => {
    render(<ActionLog {...defaultProps} />);
    expect(screen.getByText('ACTION LOG')).toBeInTheDocument();
  });

  it('renders events with time, text, and coordinates', () => {
    render(<ActionLog {...defaultProps} events={mockEvents} />);

    // Check first event
    expect(screen.getByText('12:00')).toBeInTheDocument();
    expect(screen.getByText(/Goal by Player 1/)).toBeInTheDocument();
    expect(screen.getByText('(X: 10 Y: 20)')).toBeInTheDocument();
  });

  it('filters events based on the filter prop', () => {
    const { rerender } = render(<ActionLog {...defaultProps} events={mockEvents} filter="goal" />);

    // Only the goal event should be visible
    expect(screen.getByText('Goal by Player 1')).toBeInTheDocument();
    expect(screen.queryByText('Slashing - Player 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Shot on Goal')).not.toBeInTheDocument();

    rerender(<ActionLog {...defaultProps} events={mockEvents} filter="penalty" />);
    // Only the penalty event should be visible
    expect(screen.queryByText('Goal by Player 1')).not.toBeInTheDocument();
    expect(screen.getByText('Slashing - Player 2')).toBeInTheDocument();
    expect(screen.queryByText('Shot on Goal')).not.toBeInTheDocument();
  });

  it('calls onUndo when the undo button is clicked', () => {
    render(<ActionLog {...defaultProps} events={mockEvents} />);

    // The first event is not historical and not undone, so it should have an UNDO button
    const undoButton = screen.getByText('UNDO ACTION');
    fireEvent.click(undoButton);

    expect(defaultProps.onUndo).toHaveBeenCalledWith('event-1');
  });

  it('renders REDO and applies correct styling for undone events', () => {
    render(<ActionLog {...defaultProps} events={mockEvents} />);

    // The third event is undone
    const redoButton = screen.getByText('REDO ACTION');
    expect(redoButton).toBeInTheDocument();

    // Check if the text container has line-through styling
    const textElement = screen.getByText('Shot on Goal');
    expect(textElement.className).toContain('line-through');
  });

  it('does not render undo/redo buttons for historical events', () => {
    render(<ActionLog {...defaultProps} events={mockEvents} />);

    // The second event is historical
    const historicalEventText = screen.getByText('Slashing - Player 2');
    // Get the parent container for the historical event row
    const row = historicalEventText.closest('.action-log-row');

    // Ensure no undo or redo buttons exist within this row
    if (row) {
      expect(within(row as HTMLElement).queryByRole('button')).not.toBeInTheDocument();
    } else {
      throw new Error('Row not found');
    }
  });
});
