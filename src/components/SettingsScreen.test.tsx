import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsScreen from './SettingsScreen';
import { defaultSettingsContract } from '../settingsContract';
import { vi } from 'vitest';

// Mock gasUrl util to avoid fetch in component mount
vi.mock('../utils/gasUrl', () => ({
  getGasUrl: vi.fn(() => null)
}));

describe('SettingsScreen Component', () => {
  const mockOnStart = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders correctly with default contract values', () => {
    render(<SettingsScreen contract={defaultSettingsContract} onStart={mockOnStart} onBack={mockOnBack} />);

    // Check main text/inputs based on contract defaults
    expect(screen.getByDisplayValue(defaultSettingsContract.defaultHomeTeam)).toBeInTheDocument();
    expect(screen.getByDisplayValue(defaultSettingsContract.defaultAwayTeam)).toBeInTheDocument();

    // Check start button exists
    expect(screen.getByRole('button', { name: /START GAME/i })).toBeInTheDocument();
  });

  it('renders with scheduledGameData if provided', () => {
    const scheduledData = {
      homeTeam: 'Custom Home',
      awayTeam: 'Custom Away',
    };
    render(<SettingsScreen scheduledGameData={scheduledData} contract={defaultSettingsContract} onStart={mockOnStart} onBack={mockOnBack} />);

    expect(screen.getByDisplayValue('Custom Home')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Custom Away')).toBeInTheDocument();
  });

  it('calls onStart and saves to localStorage when START GAME is clicked', async () => {
    const user = userEvent.setup();
    render(<SettingsScreen contract={defaultSettingsContract} onStart={mockOnStart} onBack={mockOnBack} />);

    const startButton = screen.getByRole('button', { name: /START GAME/i });
    await user.click(startButton);

    expect(mockOnStart).toHaveBeenCalledTimes(1);

    const savedState = localStorage.getItem('blackout_hockey_current_config');
    expect(savedState).not.toBeNull();
    const parsedState = JSON.parse(savedState as string);
    expect(parsedState.homeTeam).toBe(defaultSettingsContract.defaultHomeTeam);
    expect(parsedState.awayTeam).toBe(defaultSettingsContract.defaultAwayTeam);
  });

  it('calls onBack when back button is clicked', async () => {
    const user = userEvent.setup();
    render(<SettingsScreen contract={defaultSettingsContract} onStart={mockOnStart} onBack={mockOnBack} />);

    // The back button is a generic button without explicit text in the header, usually an icon.
    // We can find it by its onClick handler prop which is bound to a button inside header.
    // Let's find it by looking for the ChevronLeft or similar if possible, or querying the first button.
    const buttons = screen.getAllByRole('button');
    // Assuming the back button is the first button in the header
    await user.click(buttons[0]);

    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });
});
