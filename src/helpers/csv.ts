// Every CSV the panel downloads goes through here. Two things are easy to forget and fail
// silently: Excel needs a UTF-8 BOM to read umlauts, and text starting with = + - @ or a
// tab/CR is evaluated as a formula. Fetching a backend CSV with `response.text()` strips its
// BOM, so the BOM is added here on download rather than trusted from the source.

export const CSV_MIME_TYPE = 'text/csv;charset=utf-8';

const UTF8_BOM = '﻿';
const FORMULA_PREFIX = /^[=+\-@\t\r]/;

export const toCsvCell = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  let text = typeof value === 'object' ? JSON.stringify(value) : String(value);
  if (FORMULA_PREFIX.test(text)) text = `'${text}`;

  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const buildCsv = (header: unknown[], rows: unknown[][]): string =>
  [header, ...rows].map(row => row.map(toCsvCell).join(',')).join('\r\n');

export const csvBlob = (content: string): Blob =>
  new Blob([content.startsWith(UTF8_BOM) ? content : UTF8_BOM + content], {
    type: CSV_MIME_TYPE,
  });

export const downloadCsv = (content: string, fileName: string): void => {
  const url = URL.createObjectURL(csvBlob(content));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
