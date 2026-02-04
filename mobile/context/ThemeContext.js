import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const ThemeContext = createContext();

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1565C0',
    onPrimary: '#FFFFFF',
    primaryContainer: '#D0E4FF',
    onPrimaryContainer: '#001D36',
    secondary: '#00695C',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#A7F0DB',
    onSecondaryContainer: '#00201A',
    background: '#F8F9FA',
    surface: '#FFFFFF',
    surfaceVariant: '#E1E3E8', 
    onSurfaceVariant: '#40484C',
    outline: '#70787D',
    error: '#BA1A1A',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#90CAF9', // Lighter blue for dark mode
    onPrimary: '#0D47A1',
    primaryContainer: '#00325B', 
    onPrimaryContainer: '#D0E4FF',
    secondary: '#80CBC4',
    onSecondary: '#004D40',
    secondaryContainer: '#004D40',
    onSecondaryContainer: '#A7F0DB',
    background: '#121212',
    surface: '#1E1E1E',
    surfaceVariant: '#444746',
    onSurfaceVariant: '#C4C7C5', 
    outline: '#8E918F',
    error: '#CF6679',
  },
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [theme, setTheme] = useState(lightTheme);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('appTheme');
        if (storedTheme === 'dark') {
          setIsDark(true);
          setTheme(darkTheme);
        }
      } catch (e) {
        console.error("Failed to load theme", e);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newMode = !isDark;
    setIsDark(newMode);
    setTheme(newMode ? darkTheme : lightTheme);
    try {
      await AsyncStorage.setItem('appTheme', newMode ? 'dark' : 'light');
    } catch (e) {
      console.error("Failed to save theme", e);
    }
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};
