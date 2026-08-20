export type FilterListOption = {
  name: string;
  description?: string;
  display_name?: string;
  category?: string;
  label?: string;
};

export function toListSelectOptions(
  lists?: FilterListOption[] | null,
): { value: string; label: string }[] {
  return (
    lists?.map(list => ({
      value: list.name,
      label: list.label || list.display_name || list.description || list.name,
    })) ?? []
  );
}
