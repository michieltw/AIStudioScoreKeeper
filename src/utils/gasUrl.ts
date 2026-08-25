let cachedGasUrl: string | null = null;
let isCached = false;
const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbwrYL4M9Bty6MbcPHSJGFC_gdHdwRQ7TXPI7ORYAdE85pq73CkwlSsX9N5J5ZnWytS0aQ/exec';

export function getGasUrl(): string | null {
  if (!isCached) {
    cachedGasUrl = localStorage.getItem('blackout_gas_url') || DEFAULT_GAS_URL;
    isCached = true;
  }
  return cachedGasUrl;
}

export function setGasUrl(url: string): void {
  localStorage.setItem('blackout_gas_url', url);
  cachedGasUrl = url;
  isCached = true;
}
