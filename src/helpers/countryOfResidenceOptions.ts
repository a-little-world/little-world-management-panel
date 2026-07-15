export const COUNTRY_OF_RESIDENCE_GERMANY = 'DE';

export interface CountryOfResidenceApiOption {
  tag: string;
  value: string;
}

export interface CountryOfResidenceOption {
  label: string;
  value: string;
}

type ApiTranslations = Record<string, Record<string, string>>;

export function formatCountryOfResidenceOptions(
  apiOptions: CountryOfResidenceApiOption[] | undefined,
  apiTranslations: ApiTranslations,
): CountryOfResidenceOption[] {
  const germanLabels = apiTranslations.de ?? {};

  const options = (apiOptions ?? []).map(({ tag, value }) => ({
    value,
    label: germanLabels[tag] ?? tag,
  }));

  const germany = options.find(({ value }) => value === COUNTRY_OF_RESIDENCE_GERMANY);
  const others = options
    .filter(({ value }) => value !== COUNTRY_OF_RESIDENCE_GERMANY)
    .sort((a, b) => a.label.localeCompare(b.label, 'de'));

  return germany ? [germany, ...others] : others;
}

export function getCountryOfResidenceLabel(
  code: string,
  options: CountryOfResidenceOption[],
): string {
  return options.find(({ value }) => value === code)?.label ?? code;
}
