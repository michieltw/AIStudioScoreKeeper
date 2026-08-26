// Mapping of country names, variations, and codes to ISO 3166-1 alpha-2 country codes

export const COUNTRY_TO_ISO2: Record<string, string> = {
  // Common Hockey Nations
  'netherlands': 'nl',
  'the netherlands': 'nl',
  'holland': 'nl',
  'nederland': 'nl',
  'nl': 'nl',
  'nld': 'nl',

  'canada': 'ca',
  'ca': 'ca',
  'can': 'ca',

  'united states': 'us',
  'united states of america': 'us',
  'usa': 'us',
  'us': 'us',
  'america': 'us',

  'sweden': 'se',
  'sverige': 'se',
  'se': 'se',
  'swe': 'se',

  'finland': 'fi',
  'suomi': 'fi',
  'fi': 'fi',
  'fin': 'fi',

  'czech republic': 'cz',
  'czechia': 'cz',
  'cz': 'cz',
  'cze': 'cz',

  'germany': 'de',
  'deutschland': 'de',
  'de': 'de',
  'deu': 'de',
  'ger': 'de',

  'switzerland': 'ch',
  'swiss': 'ch',
  'schweiz': 'ch',
  'suisse': 'ch',
  'ch': 'ch',
  'che': 'ch',
  'sui': 'ch',

  'slovakia': 'sk',
  'slovak republic': 'sk',
  'slovensko': 'sk',
  'sk': 'sk',
  'svk': 'sk',

  'russia': 'ru',
  'russian federation': 'ru',
  'ru': 'ru',
  'rus': 'ru',

  'norway': 'no',
  'norge': 'no',
  'no': 'no',
  'nor': 'no',

  'denmark': 'dk',
  'danmark': 'dk',
  'dk': 'dk',
  'dnk': 'dk',
  'den': 'dk',

  'latvia': 'lv',
  'latvija': 'lv',
  'lv': 'lv',
  'lva': 'lv',
  'lat': 'lv',

  'france': 'fr',
  'fr': 'fr',
  'fra': 'fr',

  'austria': 'at',
  'österreich': 'at',
  'at': 'at',
  'aut': 'at',

  'united kingdom': 'gb',
  'great britain': 'gb',
  'uk': 'gb',
  'gb': 'gb',
  'gbr': 'gb',
  'england': 'gb-eng',
  'scotland': 'gb-sct',
  'wales': 'gb-wls',

  'belgium': 'be',
  'belgië': 'be',
  'belgique': 'be',
  'be': 'be',
  'bel': 'be',

  'italy': 'it',
  'italia': 'it',
  'it': 'it',
  'ita': 'it',

  'poland': 'pl',
  'polska': 'pl',
  'pl': 'pl',
  'pol': 'pl',

  'japan': 'jp',
  'jp': 'jp',
  'jpn': 'jp',

  'south korea': 'kr',
  'korea': 'kr',
  'republic of korea': 'kr',
  'kr': 'kr',
  'kor': 'kr',

  'china': 'cn',
  'cn': 'cn',
  'chn': 'cn',

  'australia': 'au',
  'au': 'au',
  'aus': 'au',

  'new zealand': 'nz',
  'nz': 'nz',
  'nzl': 'nz',

  'ukraine': 'ua',
  'ua': 'ua',
  'ukr': 'ua',

  'belarus': 'by',
  'by': 'by',
  'blr': 'by',

  'kazakhstan': 'kz',
  'kz': 'kz',
  'kaz': 'kz',

  'hungary': 'hu',
  'magyarország': 'hu',
  'hu': 'hu',
  'hun': 'hu',

  'slovenia': 'si',
  'slovenija': 'si',
  'si': 'si',
  'svn': 'si',
  'slo': 'si',

  'croatia': 'hr',
  'hrvatska': 'hr',
  'hr': 'hr',
  'hrv': 'hr',
  'cro': 'hr',

  'estonia': 'ee',
  'eesti': 'ee',
  'ee': 'ee',
  'est': 'ee',

  'lithuania': 'lt',
  'lietuva': 'lt',
  'lt': 'lt',
  'ltu': 'lt',

  'spain': 'es',
  'españa': 'es',
  'es': 'es',
  'esp': 'es',

  'mexico': 'mx',
  'méxico': 'mx',
  'mx': 'mx',
  'mex': 'mx',

  'iceland': 'is',
  'ísland': 'is',
  'is': 'is',
  'isl': 'is',

  'ireland': 'ie',
  'éire': 'ie',
  'ie': 'ie',
  'irl': 'ie',

  'portugal': 'pt',
  'pt': 'pt',
  'prt': 'pt',

  'greece': 'gr',
  'hellas': 'gr',
  'gr': 'gr',
  'grc': 'gr',

  'turkey': 'tr',
  'türkiye': 'tr',
  'tr': 'tr',
  'tur': 'tr',

  'israel': 'il',
  'il': 'il',
  'isr': 'il',

  'south africa': 'za',
  'za': 'za',
  'zaf': 'za',
  'rsa': 'za',

  'brazil': 'br',
  'brasil': 'br',
  'br': 'br',
  'bra': 'br',

  'argentina': 'ar',
  'ar': 'ar',
  'arg': 'ar',
};

/**
 * Returns the ISO 3166-1 alpha-2 code for a given country name or abbreviation.
 */
export function getCountryIso2(nationality?: string | null): string | null {
  if (!nationality || typeof nationality !== 'string') return null;
  const clean = nationality.trim().toLowerCase();
  if (!clean) return null;

  if (COUNTRY_TO_ISO2[clean]) {
    return COUNTRY_TO_ISO2[clean];
  }

  // If input is already 2 letters (e.g. "NL", "US", "DE"), use it directly
  if (/^[a-z]{2}$/i.test(clean)) {
    return clean.toLowerCase();
  }

  return null;
}

/**
 * Converts a 2-letter ISO country code to its corresponding Unicode Flag Emoji.
 */
export function getCountryFlagEmoji(iso2?: string | null): string {
  if (!iso2 || typeof iso2 !== 'string') return '';
  const clean = iso2.trim().toUpperCase();
  if (clean.length !== 2 || !/^[A-Z]{2}$/.test(clean)) return '';

  try {
    return String.fromCodePoint(...[...clean].map(c => 127397 + c.charCodeAt(0)));
  } catch {
    return '';
  }
}

/**
 * Returns the FlagCDN image URL for an ISO code.
 */
export function getFlagCdnUrl(iso2: string, width: 20 | 40 | 80 | 160 = 40): string {
  return `https://flagcdn.com/w${width}/${iso2.toLowerCase()}.png`;
}
