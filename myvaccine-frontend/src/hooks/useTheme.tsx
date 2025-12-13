import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  colorScheme: ThemeMode;
  toggleColorScheme: () => void;
  setColorScheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [colorScheme, setColorSchemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('myvaccine-theme');
    return (saved as ThemeMode) || 'light';
  });

  useEffect(() => {
    localStorage.setItem('myvaccine-theme', colorScheme);
    // Atualizar classe no body para CSS global
    document.body.setAttribute('data-theme', colorScheme);
  }, [colorScheme]);

  const toggleColorScheme = () => {
    setColorSchemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setColorScheme = (mode: ThemeMode) => {
    setColorSchemeState(mode);
  };

  return (
    <ThemeContext.Provider value={{ colorScheme, toggleColorScheme, setColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

