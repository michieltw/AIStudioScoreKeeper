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
    (global.fetch as Mock).mockImplementation((url) => {
        if (url === '/api/login') {
            return Promise.resolve({
                ok: false,
                json: async () => ({ success: false, message: 'Invalid credentials' }),
                clone: function() { return this; }
            });
        }
        return Promise.resolve({
            ok: true,
            json: async () => ({
                status: 'Success',
                data: [['id', 'name'], ['league-1', 'Test League']]
            }),
            clone: function() { return this; }
        });
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

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(mockOnLogin).not.toHaveBeenCalled();
    expect(await screen.findByText(/Invalid email or password/i)).toBeInTheDocument();
  });

  it('calls onLogin callback with valid default credentials', async () => {
    (global.fetch as Mock).mockImplementation((url) => {
        if (url === '/api/login') {
            return Promise.resolve({
                ok: true,
                json: async () => ({ success: true, token: 'dummy-jwt-token', user: { id: 'admin', role: 'Admin' } }),
                clone: function() { return this; }
            });
        }
        return Promise.resolve({
            ok: true,
            json: async () => ({
                status: 'Success',
                data: [['id', 'name'], ['league-1', 'Test League']]
            }),
            clone: function() { return this; }
        });
    });

    const mockOnLogin = vi.fn();
    const user = userEvent.setup();
    render(<LoginScreen onLogin={mockOnLogin} />);

    // We need to wait for the league fetch to complete to ensure the button is enabled and works
    await screen.findByRole('option', { name: /Test League/i });

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const loginButton = screen.getByRole('button', { name: /LOGIN/i });

    await user.type(emailInput, 'admin@blackouthockey.com');
    await user.type(passwordInput, 'securepassword123');

    await user.click(loginButton);

    // Wait for the login fetch to complete and the onLogin to be called
    await vi.waitFor(() => expect(mockOnLogin).toHaveBeenCalledTimes(1));

    expect(global.fetch).toHaveBeenCalled();
    expect(screen.queryByText(/Invalid email or password/i)).not.toBeInTheDocument();
  });
});
