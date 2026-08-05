import { MultiSelect } from '@a-little-world/little-world-design-system';
import React from 'react';

import { useGlobalState } from '../../../store';

interface LangSkill {
  lang: string;
  level: string;
}

interface ApiOption {
  tag: string;
  value: string;
}

interface UserLanguageApiOptions {
  profile: {
    lang_skill: {
      lang: ApiOption[];
      level: ApiOption[];
    };
  };
}

type ApiTranslations = Record<string, Record<string, string>>;

interface UserLanguagesProps {
  langSkill: LangSkill[];
}

const firstDropdownProps = {
  dataField: 'lang',
  ariaLabel: 'Language',
  placeholder: 'Select a language',
};

const secondDropdownProps = {
  dataField: 'level',
  ariaLabel: 'Language Level',
  placeholder: 'Select a level',
};

const UserLanguages = ({ langSkill }: UserLanguagesProps) => {
  const { apiOptions, apiTranslations } = useGlobalState();
  const languageOptions = apiOptions as UserLanguageApiOptions;
  const translations = apiTranslations as ApiTranslations;

  return (
    <MultiSelect
      locked
      addMoreLabel="Add language"
      onValueChange={() => undefined}
      firstSelect={{
        ...firstDropdownProps,
        errors: [],
        values: langSkill?.map(el => el.lang) ?? [],
        options: languageOptions.profile.lang_skill.lang.map(
          ({ tag, value }) => ({
            label: translations.en[tag],
            value,
          }),
        ),
      }}
      secondSelect={{
        ...secondDropdownProps,
        errors: [],
        values: langSkill?.map(el => el.level) ?? [],
        options: languageOptions.profile.lang_skill.level.map(
          ({ tag, value }) => ({
            label: translations.en[tag],
            value,
          }),
        ),
      }}
    />
  );
};

export default UserLanguages;
