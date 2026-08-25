import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import * as gasUrlModule from './utils/gasUrl';

// Mock dependencies to avoid actual network requests and test timeouts
vi.mock('./utils/gasUrl', () => ({
  getGasUrl: vi.fn(() => null),
  setGasUrl: vi.fn(),
}));

describe('App Routing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        user: { id: 'test', role: 'Admin', email: 'admin@blackout.com' }
      })
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  })

  it('renders LoginScreen initially', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('navigates to MainMenuScreen after login', async () => {
    render(<App />);

    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'admin@blackout.com' } });
    fireEvent.change(passwordInput, { target: { value: 'admin' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('NEW GAME')).toBeInTheDocument();
      // Since Dashboard is rendered by the sidebar, we test for it being in the document
      expect(screen.getByRole('button', { name: /Dashboard/i })).toBeInTheDocument();
    });
  });

  it('navigates to Dashboard via Sidebar', async () => {
    render(<App />);

    // Login
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(emailInput, { target: { value: 'admin@blackout.com' } });
    fireEvent.change(passwordInput, { target: { value: 'admin' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => expect(screen.getByText('NEW GAME')).toBeInTheDocument());

    const dashboardLink = screen.getByRole('button', { name: /Dashboard/i });
    fireEvent.click(dashboardLink);

    // Should still be on main menu
    expect(screen.getByText('NEW GAME')).toBeInTheDocument();
  });

  it('restricts guests from starting games and viewing database', async () => {
    render(<App />);

    const guestButton = screen.getByRole('button', { name: /CONTINUE AS GUEST/i });
    fireEvent.click(guestButton);

    await waitFor(() => {
      expect(screen.getByText('NEW GAME')).toBeInTheDocument();
    });

    // Both Dashboard and Sidebar NEW GAME buttons are disabled
    const newGameButtons = screen.getAllByRole('button', { name: /new game/i });
    expect(newGameButtons.length).toBeGreaterThanOrEqual(1);
    newGameButtons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });

    // Database button is not present in sidebar for guests
    expect(screen.queryByRole('button', { name: /^Database$/i })).not.toBeInTheDocument();
  });

  it('restricts player and team manager from viewing database', async () => {
    // Test Team Manager
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        user: { id: 'tm1', role: 'Team Manager', email: 'tm@blackout.com' }
      })
    });

    const { unmount } = render(<App />);

    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(emailInput, { target: { value: 'tm@blackout.com' } });
    fireEvent.change(passwordInput, { target: { value: 'tm' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => expect(screen.getByText('NEW GAME')).toBeInTheDocument());

    // Team Manager should NOT see Database in sidebar
    expect(screen.queryByRole('button', { name: /^Database$/i })).not.toBeInTheDocument();

    unmount();

    // Test Player
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        user: { id: 'p1', role: 'Player', email: 'player@blackout.com' }
      })
    });

    render(<App />);

    const emailInput2 = screen.getByRole('textbox', { name: /email/i });
    const passwordInput2 = screen.getByLabelText(/password/i);
    fireEvent.change(emailInput2, { target: { value: 'player@blackout.com' } });
    fireEvent.change(passwordInput2, { target: { value: 'player' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => expect(screen.getByText('NEW GAME')).toBeInTheDocument());

    // Player should NOT see Database in sidebar
    expect(screen.queryByRole('button', { name: /^Database$/i })).not.toBeInTheDocument();
  });
});
