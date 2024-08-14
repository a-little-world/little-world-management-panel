import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getCookiesAsObject = () => {
  // stolen: https://stackoverflow.com/a/64472572
  return Object.fromEntries(
    document.cookie
      .split('; ')
      .map(v => v.split(/=(.*)/s).map(decodeURIComponent)),
  );
};
