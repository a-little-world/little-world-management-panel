import { csvBlob } from '../../../../helpers/csv';

export const downloadFile = (
  content: string | object,
  filename: string,
  mimeType: string = 'application/json',
): void => {
  const data = typeof content === 'string' ? content : JSON.stringify(content);
  const blob = mimeType.startsWith('text/csv')
    ? csvBlob(data)
    : new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
