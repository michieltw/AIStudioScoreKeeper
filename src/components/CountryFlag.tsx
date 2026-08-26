import React, { useState } from 'react';
import { getCountryIso2, getCountryFlagEmoji, getFlagCdnUrl } from '../utils/countryFlags';
import { Globe } from 'lucide-react';

export interface CountryFlagProps {
  nationality?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  showName?: boolean;
  nameClassName?: string;
}

const sizeClasses = {
  xs: 'w-4 h-2.5 rounded-[2px]',
  sm: 'w-5 h-3.5 rounded-[2px]',
  md: 'w-6 h-4 rounded-[3px]',
  lg: 'w-8 h-5.5 rounded-sm'
};

const emojiSizeClasses = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl'
};

export default function CountryFlag({
  nationality,
  size = 'sm',
  className = '',
  showName = false,
  nameClassName = 'text-xs font-medium text-white'
}: CountryFlagProps) {
  const [imgError, setImgError] = useState(false);

  if (!nationality) return null;

  const iso2 = getCountryIso2(nationality);
  const emoji = iso2 ? getCountryFlagEmoji(iso2) : '';

  // If no ISO code found, show a subtle globe or label
  if (!iso2) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 align-middle ${className}`}
        title={nationality}
      >
        <Globe className="w-3.5 h-3.5 text-on-surface-variant/70 shrink-0" />
        {showName && <span className={nameClassName}>{nationality}</span>}
      </span>
    );
  }

  const flagUrl = getFlagCdnUrl(iso2, size === 'lg' ? 80 : 40);

  return (
    <span
      className={`inline-flex items-center gap-1.5 align-middle select-none ${className}`}
      title={nationality}
      aria-label={`Nationality: ${nationality}`}
    >
      {!imgError ? (
        <img
          src={flagUrl}
          srcSet={`${getFlagCdnUrl(iso2, 80)} 2x`}
          alt={nationality}
          className={`${sizeClasses[size]} object-cover shadow-sm border border-white/20 shrink-0 inline-block align-middle`}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : emoji ? (
        <span className={`${emojiSizeClasses[size]} leading-none shrink-0 inline-block align-middle`} role="img" aria-label={nationality}>
          {emoji}
        </span>
      ) : (
        <Globe className="w-3.5 h-3.5 text-on-surface-variant/70 shrink-0" />
      )}

      {showName && (
        <span className={nameClassName}>{nationality}</span>
      )}
    </span>
  );
}
