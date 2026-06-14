export function censorSecret(value: string): string {
  if (!value) {
    return '';
  }

  if (value.length <= 4) {
    return '•'.repeat(value.length);
  }

  const hiddenLength = Math.min(value.length - 4, 20);
  return `${'•'.repeat(hiddenLength)}${value.slice(-4)}`;
}
