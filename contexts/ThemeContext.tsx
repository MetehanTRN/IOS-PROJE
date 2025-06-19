import React, { createContext, useContext, useEffect, useState } from 'react';
import { DefaultTheme, MD3DarkTheme, MD3Theme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tema context'i için tip tanımı
type ThemeContextType = {
  theme: MD3Theme;
  isDark: boolean;
  toggleTheme: () => void;
};

// Varsayılan context
const ThemeContext = createContext<ThemeContextType>({
  theme: MD3DarkTheme,
  isDark: true,
  toggleTheme: () => {},
});

// ThemeProvider bileşeni, tema bilgisini sağlayan context sarmalayıcısıdır
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(true); // Tema durumu (dark/light)

  // Uygulama açıldığında AsyncStorage'dan tema bilgisini yükle
  useEffect(() => {
    const loadTheme = async () => {
      const value = await AsyncStorage.getItem('APP_THEME');
      if (value === 'light') setIsDark(false);
    };
    loadTheme();
  }, []);

  // Tema geçiş fonksiyonu (dark <-> light)
  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    await AsyncStorage.setItem('APP_THEME', newTheme ? 'dark' : 'light');
  };

  // Seçilen tema değerini belirle
  const theme = isDark ? MD3DarkTheme : DefaultTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Tema context'ine erişmek için özel hook
export const useThemeContext = () => useContext(ThemeContext);
