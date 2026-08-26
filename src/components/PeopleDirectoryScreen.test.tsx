import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import PeopleDirectoryScreen from './PeopleDirectoryScreen';

describe('PeopleDirectoryScreen', () => {
  const mockOnBack = vi.fn();
  const mockOnViewPerson = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('blackout_gas_url', 'https://script.google.com/macros/s/test/exec');
    (global.fetch as any) = vi.fn().mockImplementation((url: string, options: any) => {
      const body = options?.body ? JSON.parse(options.body) : {};

      if (body.action === 'getEcosystemData' && body.sheetName === 'persons') {
        return Promise.resolve(new Response(JSON.stringify({
          status: 'Success',
          data: [
            ['id', 'first_name', 'last_name', 'person_code', 'plays_position', 'nationality', 'photo_url', 'cover_url'],
            ['p-101', 'Connor', 'McDavid', 'CMD97', 'Center', 'Canada', 'https://example.com/cm.jpg', ''],
            ['p-102', 'Leon', 'Draisaitl', 'LD29', 'Center', 'Germany', 'https://example.com/ld.jpg', '']
          ]
        }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
      }

      return Promise.resolve(new Response(JSON.stringify({
        status: 'Success',
        data: []
      }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    });
  });

  it('renders directory with nationality flags for people', async () => {
    render(<PeopleDirectoryScreen onBack={mockOnBack} onViewPerson={mockOnViewPerson} />);

    await waitFor(() => {
      expect(screen.getByText('Connor McDavid')).toBeInTheDocument();
      expect(screen.getByText('Leon Draisaitl')).toBeInTheDocument();
    });

    const flags = screen.getAllByRole('img');
    const canadaFlag = flags.find(el => el.getAttribute('alt') === 'Canada');
    const germanyFlag = flags.find(el => el.getAttribute('alt') === 'Germany');

    expect(canadaFlag).toBeDefined();
    expect(germanyFlag).toBeDefined();
  });
});
