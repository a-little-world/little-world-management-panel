import { format, formatDistance } from 'date-fns';
import { de, enGB } from 'date-fns/locale';

import { LANGUAGES } from '../constants.js'

const two = (n: number) => (n < 10 ? `0${n}` : n);

export const formatTime = (date: Date) => {
  return `${two(date.getHours())}:${two(date.getMinutes())}`;
};

export const formatDate = (
  date: Date,
  formatStr: string = 'cccc, LLLL do',
  locale?: string,
) => {
  return format(date, formatStr, {
    locale: locale === LANGUAGES.de ? de : enGB,
  });
};

export const formatTimeDistance = (from: Date, to: Date, locale: string) => {
  return formatDistance(from, to, {
    addSuffix: true,
    locale: locale === LANGUAGES.de ? de : enGB,
  });
};
