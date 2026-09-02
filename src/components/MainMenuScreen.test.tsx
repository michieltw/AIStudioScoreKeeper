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


  it('hides video overlay when skip button is clicked', () => {
    render(<MainMenuScreen {...mockProps} />);
    const skipButton = screen.getByText('SKIP');
    expect(skipButton).toBeInTheDocument();

    fireEvent.click(skipButton);

    // Skip button should disappear after clicking
    expect(screen.queryByText('SKIP')).not.toBeInTheDocument();
  });

  it('prevents guest users from starting a new game', async () => {
    const guestUser = { id: 'guest', email: 'guest@blackouthockey.com', role: 'Guest' as const };

    render(<MainMenuScreen {...mockProps} currentUser={guestUser} />);

    const newGameButton = screen.getByRole('button', { name: /NEW GAME/i });
    expect(newGameButton).toBeDisabled();
    fireEvent.click(newGameButton);
    expect(mockProps.onNewGame).not.toHaveBeenCalled();
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
