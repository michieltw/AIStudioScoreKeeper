import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DatabaseScreen from './DatabaseScreen';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('DatabaseScreen', () => {
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Mock fetch
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders and initializes with values from localStorage', () => {
    localStorage.setItem('blackout_gas_url', 'https://example.com/gas');
    localStorage.setItem('blackout_gas_token', 'test-token-123');

    render(<DatabaseScreen onBack={mockOnBack} />);

    expect(screen.getByDisplayValue('https://example.com/gas')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test-token-123')).toBeInTheDocument();
    expect(screen.getByText('Geen connectie getest')).toBeInTheDocument();
  });

  it('generates a new token if not present in localStorage', () => {
    const mockUUID = 'generated-uuid-456';
    vi.spyOn(crypto, 'randomUUID').mockReturnValue(mockUUID as `${string}-${string}-${string}-${string}-${string}`);

    render(<DatabaseScreen onBack={mockOnBack} />);

    expect(screen.getByDisplayValue(mockUUID)).toBeInTheDocument();
    expect(localStorage.getItem('blackout_gas_token')).toBe(mockUUID);
  });

  it('calls onBack when back button is clicked', async () => {
    const user = userEvent.setup();
    render(<DatabaseScreen onBack={mockOnBack} />);

    // The back button does not have text, it has an ArrowLeft icon. We can find it by role or nearest text
    // The closest distinct element is the button before the h1 "Database Connection"
    // Since it has no aria-label, let's find the h1 and navigate, or just use getAllByRole and pick the first button
    const buttons = screen.getAllByRole('button');
    const backButton = buttons[0]; // Assuming it's the first button in the header

    await user.click(backButton);
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('tests connection and shows success on valid fetch response', async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      type: 'basic'
    });

    render(<DatabaseScreen onBack={mockOnBack} />);

    const urlInput = screen.getByPlaceholderText('https://script.google.com/macros/s/...');
    await user.clear(urlInput);
    await user.type(urlInput, 'https://script.google.com/macros/s/test');

    const saveButton = screen.getByRole('button', { name: /Opslaan/i });
    await user.click(saveButton);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://script.google.com/macros/s/test',
      expect.objectContaining({
        method: 'POST',
        mode: 'no-cors',
      })
    );

    await waitFor(() => {
      expect(screen.getByText('Verbonden')).toBeInTheDocument();
    });
    expect(localStorage.getItem('blackout_gas_url')).toBe('https://script.google.com/macros/s/test');
  });

  it('tests connection and shows error on failed fetch response', async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    render(<DatabaseScreen onBack={mockOnBack} />);

    const urlInput = screen.getByPlaceholderText('https://script.google.com/macros/s/...');
    await user.clear(urlInput);
    await user.type(urlInput, 'https://example.com/bad-url');

    const saveButton = screen.getByRole('button', { name: /Opslaan/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Fout / Ongeldige URL')).toBeInTheDocument();
    });
  });

  it('tests connection and shows success if CORS blocks but it is a google macro URL', async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockRejectedValueOnce(new Error('Failed to fetch'));

    render(<DatabaseScreen onBack={mockOnBack} />);

    const urlInput = screen.getByPlaceholderText('https://script.google.com/macros/s/...');
    await user.type(urlInput, 'https://script.google.com/macros/s/some-valid-id');

    const saveButton = screen.getByRole('button', { name: /Opslaan/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Verbonden')).toBeInTheDocument();
    });
  });

  it('copies generated code to clipboard', async () => {
    const user = userEvent.setup();
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      writable: true,
      configurable: true
    });

    render(<DatabaseScreen onBack={mockOnBack} />);

    const copyButton = screen.getByTitle('Kopieer Code');
    await user.click(copyButton);

    expect(mockWriteText).toHaveBeenCalledTimes(1);
    const clipboardContent = mockWriteText.mock.calls[0][0];
    expect(clipboardContent).toContain('function setupSheet()');

    expect(screen.getByText('Gekopieerd')).toBeInTheDocument();
  });
});
