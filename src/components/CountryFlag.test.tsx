import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CountryFlag from './CountryFlag';
import { getCountryIso2, getCountryFlagEmoji } from '../utils/countryFlags';

describe('countryFlags utility', () => {
  it('correctly resolves country names and codes to ISO2', () => {
    expect(getCountryIso2('Netherlands')).toBe('nl');
    expect(getCountryIso2('holland')).toBe('nl');
    expect(getCountryIso2('Canada')).toBe('ca');
    expect(getCountryIso2('USA')).toBe('us');
    expect(getCountryIso2('United States')).toBe('us');
    expect(getCountryIso2('Sweden')).toBe('se');
    expect(getCountryIso2('Finland')).toBe('fi');
    expect(getCountryIso2('Czech Republic')).toBe('cz');
    expect(getCountryIso2('Germany')).toBe('de');
    expect(getCountryIso2('Slovakia')).toBe('sk');
    expect(getCountryIso2('Switzerland')).toBe('ch');
  });

  it('converts ISO2 code to unicode flag emoji', () => {
    expect(getCountryFlagEmoji('nl')).toBe('🇳🇱');
    expect(getCountryFlagEmoji('ca')).toBe('🇨🇦');
    expect(getCountryFlagEmoji('us')).toBe('🇺🇸');
  });
});

describe('CountryFlag component', () => {
  it('renders flag image for recognized nationality', () => {
    render(<CountryFlag nationality="Netherlands" />);
    const img = screen.getByRole('img', { name: /netherlands/i });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://flagcdn.com/w40/nl.png');
  });

  it('renders country name when showName is true', () => {
    render(<CountryFlag nationality="Canada" showName />);
    expect(screen.getByText('Canada')).toBeInTheDocument();
  });

  it('renders nothing when nationality is null or undefined', () => {
    const { container } = render(<CountryFlag nationality={undefined} />);
    expect(container.firstChild).toBeNull();
  });
});
