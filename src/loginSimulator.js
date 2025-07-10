import { USER_FILTERS, baseLogin, baseUrl } from './constants.ts';
import * as utils from './lib/utils.ts';

/*
The 'data' should prob be centralized in some env-file
Be aware that using the loginSimulator will only work in combination with 'schroedingers-nginx.sh'
*/
function filtersAsParams(filterList) {
  return !filterList.length ? '' : '?filter=' + filterList.join('&filter=');
}

// eslint-disable-next-line no-unused-vars
function inferFiltersFromParams() {
  /*
   * Infers the currently selected filter tags from the url parameters,
   * This can be used if the users enters the filters in the urls manually but we want to show the ui for selected filters asual
   * This is limited to singe filter tags, also there are cases where the filter can't be inferred
   */
  const urlParams = new URLSearchParams(window.location.search);
  const filterStrings = urlParams.getAll('filter').sort();
  const filterTags = Object.keys(USER_FILTERS).filter(
    k => USER_FILTERS[k].filters.sort().toString() === filterStrings.toString(),
  );
  return filterTags;
}

export function simulateFilterUpdate(filterList) {
  /*
   * Takes a list of filters an emulates production behavior by saving them to loacal storage and then reloading the page
   */
  localStorage.setItem('filters', filterList);
  window.location.search = filtersAsParams(filterList);
}

export function simulatedAutoLogin(
  username = baseLogin.username,
  password = baseLogin.passoword,
) {
  const filters =
    localStorage.getItem('filters') || USER_FILTERS.allVolunteers.filters;
  // return Promise.resolve(JSON.stringify(MOCK_DATA));
  return fetch(`${baseUrl}/api2/login_hack/`, {
    method: 'POST',
    credentials: 'include',
    body: utils.objectToFormData({
      username,
      password,
      dev_dataset: 'admin_area',
      /*
      Filters are handled via get-params in production, this is just to simulate production,
      TODO: there is still an issue with lists not being delivered as real list using the `utils.objectToFormData`
      */
      filter: filters,
    }),
  }).then(response => {
    if (response.ok) {
      return response.json();
    }
  });
}
