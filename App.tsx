import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import DrawerNavigator from './navigation/DrawerNavigator';
import { DefinicoesProvider, DefinicoesContext } from './DefinicoesContext';
import { LightTheme, DarkTheme } from './theme';
import { useContext } from 'react';

function Main() {
  const { modoEscuro } = useContext(DefinicoesContext);

  return (
    <PaperProvider theme={modoEscuro ? DarkTheme : LightTheme}>
      <DrawerNavigator />
    </PaperProvider>
  );
}

export default function App() {
  return (
    <DefinicoesProvider>
      <Main />
    </DefinicoesProvider>
  );
}
