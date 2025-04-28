import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const LightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#5e35b1',
    background: '#ffffff',
    surface: '#ffffff',
    error: '#B00020',
    onPrimary: '#ffffff',
    onBackground: '#000000',
    onSurface: '#000000',
  },
};

export const DarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#bb86fc',
    background: '#121212',
    surface: '#1e1e1e',
    error: '#cf6679',
    onPrimary: '#000000',
    onBackground: '#ffffff',
    onSurface: '#ffffff',
  },
};
