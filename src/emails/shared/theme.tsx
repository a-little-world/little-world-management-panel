import React, { ReactNode, createContext, useMemo, useState } from 'react';

import { THEMES } from './constants';

export type Theme = keyof typeof THEMES;

type ThemeContextType = {
  emailTheme: Theme;
  emailThemeContent: (typeof THEMES)[keyof typeof THEMES];
  setEmailTheme: (theme: Theme) => void;
};

export const EmailThemeContext = createContext<ThemeContextType | undefined>(
  undefined,
);

export const EmailThemeProvider = ({ children }: { children: ReactNode }) => {
  const [emailTheme, setEmailTheme] = useState<Theme>('little_world');

  const value = useMemo(
    () => ({
      emailTheme,
      emailThemeContent: THEMES[emailTheme],
      setEmailTheme,
    }),
    [emailTheme],
  );

  return (
    <EmailThemeContext.Provider value={value}>
      {children}
    </EmailThemeContext.Provider>
  );
};
