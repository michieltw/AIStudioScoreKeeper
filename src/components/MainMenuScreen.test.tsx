import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MainMenuScreen from './MainMenuScreen';
import * as gasUrlModule from '../utils/gasUrl';

// Mock dependencies to avoid actual network requests and test timeouts
vi.mock('../utils/gasUrl', () => ({
  getGasUrl: vi.fn(() => null),
  setGasUrl: vi.fn(),
}));

describe('MainMenuScreen', () => {
  const mockProps = {
    onNewGame: vi.fn(),
    onStartScheduledGame: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders correctly', () => {
    render(<MainMenuScreen {...mockProps} />);

    // Check main buttons are present
    expect(screen.getByText('NEW GAME')).toBeInTheDocument();
    expect(screen.getByText('Announcements')).toBeInTheDocument();
  });

  it('calls onNewGame when NEW GAME button is clicked', () => {
    render(<MainMenuScreen {...mockProps} />);
    const newGameButton = screen.getByText('NEW GAME');
    fireEvent.click(newGameButton);
    expect(mockProps.onNewGame).toHaveBeenCalledTimes(1);
  });

  it('renders scheduled games from localStorage', async () => {
    const games = [{
      id: '1', homeTeam: 'Team A', awayTeam: 'Team B',
      date: '2023-10-27', time: '20:00', location: 'Rink 1',
      competition: 'Friendly', matchType: 'Exhibition'
    }];
    localStorage.setItem('blackout_scheduled_games', JSON.stringify(games));

    render(<MainMenuScreen {...mockProps} />);

    // Wait for the scheduled games to render
    await waitFor(() => {
      expect(screen.getByText('Team A vs Team B')).toBeInTheDocument();
      expect(screen.getByText('2023-10-27 • 20:00 • Rink 1')).toBeInTheDocument();
    });
  });

  it('calls onStartScheduledGame when a scheduled game is clicked', async () => {
    const games = [{
      id: '1', homeTeam: 'Team A', awayTeam: 'Team B',
      date: '2023-10-27', time: '20:00', location: 'Rink 1',
      competition: 'Friendly', matchType: 'Exhibition'
    }];
    localStorage.setItem('blackout_scheduled_games', JSON.stringify(games));

    render(<MainMenuScreen {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Team A vs Team B')).toBeInTheDocument();
    });

    const gameButton = screen.getByText('Team A vs Team B');
    fireEvent.click(gameButton);

    expect(mockProps.onStartScheduledGame).toHaveBeenCalledTimes(1);
    expect(mockProps.onStartScheduledGame).toHaveBeenCalledWith(games[0]);
  });

  it('hides video overlay when skip button is clicked', () => {
    render(<MainMenuScreen {...mockProps} />);
    const skipButton = screen.getByText('SKIP');
    expect(skipButton).toBeInTheDocument();

    fireEvent.click(skipButton);

    // Skip button should disappear after clicking
    expect(screen.queryByText('SKIP')).not.toBeInTheDocument();
  });

  it('prevents guest users from starting a new game or scheduled games', async () => {
    const guestUser = { id: 'guest', email: 'guest@blackouthockey.com', role: 'Guest' as const };
    const games = [{
      id: '1', homeTeam: 'Team A', awayTeam: 'Team B',
      date: '2023-10-27', time: '20:00', location: 'Rink 1',
      competition: 'Friendly', matchType: 'Exhibition'
    }];
    localStorage.setItem('blackout_scheduled_games', JSON.stringify(games));

    render(<MainMenuScreen {...mockProps} currentUser={guestUser} />);

    const newGameButton = screen.getByRole('button', { name: /NEW GAME/i });
    expect(newGameButton).toBeDisabled();
    fireEvent.click(newGameButton);
    expect(mockProps.onNewGame).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByText('Team A vs Team B')).toBeInTheDocument();
    });

    const gameButton = screen.getByText('Team A vs Team B').closest('button')!;
    expect(gameButton).toBeDisabled();
    fireEvent.click(gameButton);
    expect(mockProps.onStartScheduledGame).not.toHaveBeenCalled();
  });

  it('renders edge-to-edge banner image without color inversion in light or dark mode', () => {
    const { rerender } = render(<MainMenuScreen {...mockProps} isDarkMode={false} />);
    const bannerImg = screen.getByAltText('Dashboard Banner');
    expect(bannerImg).toBeInTheDocument();
    expect(bannerImg).toHaveAttribute('src', 'https://cdn.shopify.com/s/files/1/1038/7203/7203/files/kardinge2.png?v=1784547269');
    expect(bannerImg.parentElement).toHaveClass('scorekeeper-banner', 'w-full');

    // Rerender with isDarkMode=true
    rerender(<MainMenuScreen {...mockProps} isDarkMode={true} />);
    const bannerImgDark = screen.getByAltText('Dashboard Banner');
    expect(bannerImgDark).toBeInTheDocument();
    expect(bannerImgDark.parentElement).toHaveClass('scorekeeper-banner', 'w-full');
  });
});
