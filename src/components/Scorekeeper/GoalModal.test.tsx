import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import GoalModal, { GoalModalLabels } from './GoalModal';
import { Player } from '../../types';

describe('GoalModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  const homeRoster: Player[] = [
    { id: '1', number: '97', name: 'McDavid' },
    { id: '2', number: '29', name: 'Draisaitl' },
  ];

  const awayRoster: Player[] = [
    { id: '3', number: '34', name: 'Matthews' },
    { id: '4', number: '16', name: 'Marner' },
  ];

  const labels: GoalModalLabels = {
    title: 'DOELPUNT REGISTREREN',
    teamSelectLabel: 'Team dat scoorde',
    scorerInputLabel: 'Doelpuntenmaker (# of Naam)',
    scorerInputPlaceholder: 'bijv. #12 Matthews',
    assist1InputLabel: 'Eerste Assist (optioneel)',
    assist1InputPlaceholder: 'bijv. #16 Marner',
    assist2InputLabel: 'Tweede Assist (optioneel)',
    assist2InputPlaceholder: 'bijv. #88 Nylander',
    cancelButton: 'Annuleren',
    submitButton: 'Doelpunt Opslaan',
  };

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSubmit: mockOnSubmit,
    homeTeam: 'Oilers',
    awayTeam: 'Leafs',
    homeRoster,
    awayRoster,
    labels,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly when open', () => {
    render(<GoalModal {...defaultProps} />);

    expect(screen.getByText('DOELPUNT REGISTREREN')).toBeInTheDocument();
    expect(screen.getByText('Oilers')).toBeInTheDocument();
    expect(screen.getByText('Leafs')).toBeInTheDocument();
    expect(screen.getByText('Doelpuntenmaker (# of Naam)')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<GoalModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('DOELPUNT REGISTREREN')).not.toBeInTheDocument();
  });

  it('displays correct roster based on selected team', async () => {
    const user = userEvent.setup();
    render(<GoalModal {...defaultProps} />);

    // Default is home team (Oilers)
    expect(screen.getAllByText('97 McDavid')[0]).toBeInTheDocument();
    expect(screen.queryByText('34 Matthews')).not.toBeInTheDocument();

    // Switch to away team (Leafs)
    const awayButton = screen.getByText('Leafs');
    await user.click(awayButton);

    expect(screen.queryByText('97 McDavid')).not.toBeInTheDocument();
    expect(screen.getAllByText('34 Matthews')[0]).toBeInTheDocument(); // Can be multiple if multiple fields show roster
  });

  it('populates scorer input when roster player is clicked', async () => {
    const user = userEvent.setup();
    render(<GoalModal {...defaultProps} />);

    // Roster buttons for scorer, assist1, assist2 are rendered.
    // We should target the ones under scorer input by grabbing the first set.
    // The easiest is just clicking the first '97 McDavid' which populates scorer.
    const mcdavidButtons = screen.getAllByText('97 McDavid');
    await user.click(mcdavidButtons[0]);

    const scorerInput = screen.getByPlaceholderText('bijv. #12 Matthews');
    expect(scorerInput).toHaveValue('97 McDavid');
  });

  it('submits correctly with provided data', async () => {
    const user = userEvent.setup();
    render(<GoalModal {...defaultProps} />);

    // Type scorer
    const scorerInput = screen.getByPlaceholderText('bijv. #12 Matthews');
    await user.type(scorerInput, ' 97 McDavid ');

    // Type assist 1
    const assist1Input = screen.getByPlaceholderText('bijv. #16 Marner');
    await user.type(assist1Input, '29 Draisaitl');

    // Submit form
    const submitButton = screen.getByText('Doelpunt Opslaan');
    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    expect(mockOnSubmit).toHaveBeenCalledWith({
      team: 'home',
      scorer: '97 McDavid',
      assist1: '29 Draisaitl',
      assist2: '', // left empty
    });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('resets fields when modal reopens', () => {
    const { rerender } = render(<GoalModal {...defaultProps} />);

    // Scorer input should be empty initially
    const scorerInput = screen.getByPlaceholderText('bijv. #12 Matthews');
    fireEvent.change(scorerInput, { target: { value: '97' } });
    expect(scorerInput).toHaveValue('97');

    // Close and reopen
    rerender(<GoalModal {...defaultProps} isOpen={false} />);
    rerender(<GoalModal {...defaultProps} isOpen={true} />);

    // We have to query again as the DOM elements have been recreated
    const newScorerInput = screen.getByPlaceholderText('bijv. #12 Matthews');
    expect(newScorerInput).toHaveValue('');
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<GoalModal {...defaultProps} />);

    // Find close button by icon or cancel button text
    const cancelButton = screen.getByText('Annuleren');
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
