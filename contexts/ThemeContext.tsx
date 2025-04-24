import React, { createContext, useContext, useEffect, useState } from 'react';
import { DefaultTheme, MD3DarkTheme, MD3Theme} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeContextType = {
  theme: MD3Theme;
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: MD3DarkTheme,
  isDark: true,
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      const value = await AsyncStorage.getItem('APP_THEME');
      if (value === 'light') setIsDark(false);
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    await AsyncStorage.setItem('APP_THEME', newTheme ? 'dark' : 'light');
  };

  const theme = isDark ? MD3DarkTheme : DefaultTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);
