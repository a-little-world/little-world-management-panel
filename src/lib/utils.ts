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

/*
 * Convert JS object to FormData for use in POST requests
 * Note this is not recursive and doesn't support all types in object keys
 *
 */
export const objectToFormData = object =>
  Object.keys(object).reduce((formData, key) => {
    formData.append(key, object[key]);
    return formData;
  }, new FormData());

function curatedKeyPropList(obj) {
  const isObject = val => val && typeof val === 'object' && !Array.isArray(val);

  const addDelimiter = (a, b) => (a ? `${a}][${b}` : b);

  const paths = (obj = {}, head = '') => {
    return Object.entries(obj).reduce((product, [key, value]) => {
      let fullPath = addDelimiter(head, key);
      return isObject(value)
        ? product.concat(paths(value, fullPath))
        : Array.isArray(value)
        ? product.concat(fullPath, [value])
        : product.concat(fullPath, value);
    }, []);
  };

  return paths(obj);
}

export const recursiveObjectToFormData = object => {
  /*
   * Sorta what libaries like ajax or axios do automaticly
   * e.g.: { "key1" : {"a" : "", "b" : {"c" : "", "d" : ""}}, "key2": {"a" : "", "b": ""}}
   * to:
   * 'key1[a]' : '',
   * 'key1[b][c]' : '',
   * 'key1[b][d]' : '',
   * 'key2[a]' : '',
   * 'key2[b]' : ''
   */
  // returns a list with all even ids as keys and all uneven as object values
  const objL = curatedKeyPropList(object);
  // Some js voodo to merge every second array element and put into correct format
  return objectToFormData(
    Array(Math.floor(objL.length / 2))
      .fill(0)
      .map((x, y) => (x + y) * 2)
      .reduce((a, i) => {
        const id = objL[i].indexOf(']');
        const keyName =
          id !== -1
            ? objL[i].slice(0, id) + objL[i].slice(id + 1) + ']'
            : objL[i];
        return {
          ...a,
          ...{
            [Array.isArray(objL[i + 1]) ? keyName + '[]' : keyName]:
              objL[i + 1],
          },
        };
      }, []),
  );
};
