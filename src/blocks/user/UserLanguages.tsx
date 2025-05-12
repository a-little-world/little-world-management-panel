import { MultiDropdown } from '@a-little-world/little-world-design-system';
import React from 'react';

import { useGlobalState } from '../../store';

interface UserLanguagesProps {
  langSkill: any[];
}
const getOptions = options => {};

const firstDropdownProps = {
  dataField: 'lang',
  ariaLabel: 'Language',
  placeholder: 'Select a language',
  // options: formatDataField(formOptions?.lang_skill.lang, trans),
  // values: profile?.lang_skill?.map(el => el.lang),
};

const secondDropdownProps = {
  dataField: 'level',
  ariaLabel: 'Language Level',
  placeholder: 'Select a level',
};

const UserLanguages = ({ langSkill }: UserLanguagesProps) => {
  const { apiOptions, apiTranslations } = useGlobalState();

  return (
    <MultiDropdown
      locked
      firstDropdown={{
        ...firstDropdownProps,
        values: langSkill?.map(el => el.lang),
        options: apiOptions.profile.lang_skill.lang.map(({ tag, value }) => ({
          label: apiTranslations.en[tag],
          value,
        })),
      }}
      secondDropdown={{
        ...secondDropdownProps,
        values: langSkill?.map(el => el.level),
        options: apiOptions.profile.lang_skill.level.map(({ tag, value }) => ({
          label: apiTranslations.en[tag],
          value,
        })),
      }}
    />
  );
};

export default UserLanguages;
