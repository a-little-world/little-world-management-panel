/* 
 * Convert JS object to FormData for use in POST requests
 * Note this is not recursive and doesn't support all types in object keys 
 * 
*/
export const objectToFormData = object => Object.keys(object).reduce((formData, key) => {
    formData.append(key, object[key]);
    return formData;
}, new FormData());