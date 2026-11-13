/** Download a Blob as a file; revokes the object URL after a delay so the click keeps user activation. */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

function csvCell(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

/** Build a CSV string (with UTF-8 BOM so spreadsheets open it correctly) from headers and rows. */
export function toCsv(headers: string[], rows: (string | number)[][]): string {
  const lines = [headers, ...rows].map(cols => cols.map(csvCell).join(','));
  return `﻿${lines.join('\r\n')}\r\n`;
}

export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  downloadBlob(new Blob([toCsv(headers, rows)], { type: 'text/csv;charset=utf-8' }), filename);
}
