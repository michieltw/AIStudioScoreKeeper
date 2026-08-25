import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginScreen from './LoginScreen';
import { vi, Mock } from 'vitest';

// Mock fetch globally
global.fetch = vi.fn();

describe('LoginScreen Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with email and password inputs', () => {
    const mockOnLogin = vi.fn();
    render(<LoginScreen onLogin={mockOnLogin} />);

    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/player@blackouthockey\.com/i)).toBeInTheDocument();

    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /LOGIN/i })).toBeInTheDocument();
  });

  it('shows an error message with invalid credentials', async () => {
    (global.fetch as Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false, message: 'Invalid credentials' }),
    });

    const mockOnLogin = vi.fn();
    const user = userEvent.setup();
    render(<LoginScreen onLogin={mockOnLogin} />);

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const loginButton = screen.getByRole('button', { name: /LOGIN/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrong');
    await user.click(loginButton);

    expect(global.fetch).toHaveBeenCalledWith('/api/login', expect.any(Object));
    expect(mockOnLogin).not.toHaveBeenCalled();
    expect(await screen.findByText(/Invalid email or password/i)).toBeInTheDocument();
  });

  it('calls onLogin callback with valid default credentials', async () => {
    (global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, token: 'dummy-jwt-token' }),
    });

    const mockOnLogin = vi.fn();
    const user = userEvent.setup();
    render(<LoginScreen onLogin={mockOnLogin} />);

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const loginButton = screen.getByRole('button', { name: /LOGIN/i });

    await user.type(emailInput, 'admin@blackouthockey.com');
    await user.type(passwordInput, 'securepassword123');
    await user.click(loginButton);

    expect(global.fetch).toHaveBeenCalledWith('/api/login', expect.any(Object));
    expect(mockOnLogin).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/Invalid email or password/i)).not.toBeInTheDocument();
  });
});
