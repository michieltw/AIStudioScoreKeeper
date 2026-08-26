import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyProfileScreen from './MyProfileScreen';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { User } from '../types';

describe('MyProfileScreen - Photo & Banner Updates', () => {
  const mockOnBack = vi.fn();
  const mockUser: User = {
    id: 'u1',
    email: 'player@example.com',
    role: 'Player',
    personId: 'person-123',
    username: 'HockeyStar'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('blackout_gas_url', 'https://script.google.com/macros/s/test/exec');
    localStorage.setItem('blackout_gas_token', 'test-token-123');

    global.fetch = vi.fn().mockImplementation((url: string, options: any) => {
      const body = options?.body ? JSON.parse(options.body) : {};
      
      if (body.action === 'getEcosystemData' && body.sheetName === 'persons') {
        return Promise.resolve(new Response(JSON.stringify({
          status: 'Success',
          data: [
            ['id', 'person_code', 'first_name', 'last_name', 'date_of_birth', 'nationality', 'height_cm', 'weight_kg', 'jersey_number', 'plays_position', 'photo_url', 'cover_url', 'bio', 'created_at', 'updated_at'],
            ['person-123', 'P-001', 'Alex', 'Ovechkin', '1985-09-17', 'RUS', '190', '107', '8', 'Left Wing', 'https://example.com/alex.jpg', 'https://example.com/banner.jpg', 'Great player', '2023-01-01', '2023-01-01']
          ]
        }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
      }

      if (body.action === 'getEcosystemData' && body.sheetName === 'player_equipment') {
        return Promise.resolve(new Response(JSON.stringify({
          status: 'Success',
          data: [
            ['id', 'person_id', 'equipment_type', 'brand_id', 'serial_number', 'purchase_date', 'active_from', 'active_to', 'condition', 'notes', 'created_at', 'updated_at']
          ]
        }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
      }

      if (body.action === 'updateRow') {
        return Promise.resolve(new Response(JSON.stringify({
          status: 'Success'
        }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
      }

      return Promise.resolve(new Response(JSON.stringify({
        status: 'Success',
        data: []
      }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders profile with fetched photo_url and cover_url from persons sheet', async () => {
    render(<MyProfileScreen currentUser={mockUser} onBack={mockOnBack} />);

    await waitFor(() => {
      expect(screen.getAllByText('Alex Ovechkin').length).toBeGreaterThan(0);
    });

    const coverImg = screen.getByAltText('Cover');
    expect(coverImg).toHaveAttribute('src', 'https://example.com/banner.jpg');

    const profileImg = screen.getByAltText('Profile');
    expect(profileImg).toHaveAttribute('src', 'https://example.com/alex.jpg');
  });

  it('opens photo modal when clicking Change Banner button and saves updated cover_url to database', async () => {
    const user = userEvent.setup();
    render(<MyProfileScreen currentUser={mockUser} onBack={mockOnBack} />);

    await waitFor(() => {
      expect(screen.getAllByText('Alex Ovechkin').length).toBeGreaterThan(0);
    });

    const changeBannerBtn = screen.getByTitle('Change Banner Image');
    await user.click(changeBannerBtn);

    // Modal should be open
    expect(screen.getByText('Change Banner Image')).toBeInTheDocument();
    expect(screen.getByText('Specify the image URL for your header banner')).toBeInTheDocument();

    // Type a new URL
    const urlInput = screen.getByPlaceholderText('https://example.com/banner.jpg');
    await user.clear(urlInput);
    await user.type(urlInput, 'https://example.com/new-ice-rink.jpg');

    // Click Save
    const saveBtn = screen.getByRole('button', { name: /^save$/i });
    await user.click(saveBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'https://script.google.com/macros/s/test/exec',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"action":"updateRow"')
        })
      );
    });

    // Verify payload sent
    const lastCall = (global.fetch as any).mock.calls.find((call: any) => {
      const body = JSON.parse(call[1].body);
      return body.action === 'updateRow' && body.updateData?.cover_url === 'https://example.com/new-ice-rink.jpg';
    });
    expect(lastCall).toBeDefined();
  });

  it('opens photo modal when clicking Profile Avatar camera button and saves updated photo_url to database', async () => {
    const user = userEvent.setup();
    render(<MyProfileScreen currentUser={mockUser} onBack={mockOnBack} />);

    await waitFor(() => {
      expect(screen.getAllByText('Alex Ovechkin').length).toBeGreaterThan(0);
    });

    const changeProfileBtn = screen.getByTitle('Change Profile Picture');
    await user.click(changeProfileBtn);

    // Modal should be open
    expect(screen.getByText('Change Profile Picture')).toBeInTheDocument();
    expect(screen.getByText('Specify the image URL for your profile avatar')).toBeInTheDocument();

    // Type new profile avatar URL
    const urlInput = screen.getByPlaceholderText('https://example.com/avatar.jpg');
    await user.clear(urlInput);
    await user.type(urlInput, 'https://example.com/new-avatar.jpg');

    // Click Save
    const saveBtn = screen.getByRole('button', { name: /^save$/i });
    await user.click(saveBtn);

    await waitFor(() => {
      const lastCall = (global.fetch as any).mock.calls.find((call: any) => {
        const body = JSON.parse(call[1].body);
        return body.action === 'updateRow' && body.updateData?.photo_url === 'https://example.com/new-avatar.jpg';
      });
      expect(lastCall).toBeDefined();
    });
  });

  it('opens Edit Profile modal with expanded fields, saves updated values to GAS database', async () => {
    const user = userEvent.setup();
    render(<MyProfileScreen currentUser={mockUser} onBack={mockOnBack} />);

    await waitFor(() => {
      expect(screen.getAllByText('Alex Ovechkin').length).toBeGreaterThan(0);
    });

    // Ensure removed buttons are not rendered
    expect(screen.queryByText(/add to story/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/edit details/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/\+ add bio/i)).not.toBeInTheDocument();

    // Click Edit profile button
    const editProfileBtn = screen.getByRole('button', { name: /edit profile/i });
    await user.click(editProfileBtn);

    // Modal should be open
    expect(screen.getByText('Update personal, hockey, and federation profile information')).toBeInTheDocument();

    // Fill in expanded fields
    const bondsInput = screen.getByPlaceholderText(/e\.g\. IJN-104928/i);
    await user.type(bondsInput, 'IJN-998877');

    const playstyleInput = screen.getByPlaceholderText(/e\.g\. Sniper, Playmaker/i);
    await user.type(playstyleInput, 'Power Forward');

    // Click Save Profile
    const saveProfileBtn = screen.getByRole('button', { name: /save profile/i });
    await user.click(saveProfileBtn);

    await waitFor(() => {
      const lastCall = (global.fetch as any).mock.calls.find((call: any) => {
        const body = JSON.parse(call[1].body);
        return (
          body.action === 'updateRow' &&
          body.sheetName === 'persons' &&
          body.updateData?.ijn_bondsnummer === 'IJN-998877' &&
          body.updateData?.playstyle === 'Power Forward'
        );
      });
      expect(lastCall).toBeDefined();
    });
  });

  it('displays profile details in a structured two-column intro section', async () => {
    render(<MyProfileScreen currentUser={mockUser} onBack={mockOnBack} />);

    await waitFor(() => {
      expect(screen.getAllByText('Alex Ovechkin').length).toBeGreaterThan(0);
    });

    // Check Column 1 (Athletics & Ice)
    expect(screen.getByText('Athletics & Ice')).toBeInTheDocument();
    expect(screen.getByText('Left Wing')).toBeInTheDocument();
    expect(screen.getByText('#8')).toBeInTheDocument();
    expect(screen.getByText('190 cm')).toBeInTheDocument();
    expect(screen.getByText('107 kg')).toBeInTheDocument();

    // Check Column 2 (Personal & Federation)
    expect(screen.getByText('Personal & Federation')).toBeInTheDocument();
    expect(screen.getByText('RUS')).toBeInTheDocument();
    expect(screen.getByText('1985-09-17')).toBeInTheDocument();
    expect(screen.getByText('Male')).toBeInTheDocument();
    expect(screen.getByText('Public')).toBeInTheDocument();
  });
});
