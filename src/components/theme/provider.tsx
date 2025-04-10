import { type PropsWithChildren, useEffect, useState } from 'react';
import { Context } from './context';
import type { ThemeType } from './types';
import { loadTheme, saveTheme } from './utils';

const ThemeProvider = ({ children }: PropsWithChildren) => {
  const [theme, setTheme] = useState<ThemeType>(loadTheme);

  useEffect(() => {
    saveTheme(theme);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);
  
  return (
    <Context.Provider value={{ theme, setTheme }}>{children}</Context.Provider>
  );
};

export default ThemeProvider;
