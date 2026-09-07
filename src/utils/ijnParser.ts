/**
 * Utility functions to parse HTML fetched from the IJshockey Nederland proxy.
 */

export function parseIjnTableData(html: string): string[][] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const rows = Array.from(doc.querySelectorAll('table tbody tr'));
  const extractedData = rows.map(tr => {
      const cells = Array.from(tr.querySelectorAll('td, th'));
      return cells.map(cell => cell.textContent?.trim() || '');
  }).filter(row => row.length > 3);

  return extractedData;
}
