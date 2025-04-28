import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type DefinicoesContextType = {
  modoEscuro: boolean;
  moeda: string;
  alternarModoEscuro: () => void;
  mudarMoeda: (novaMoeda: string) => void;
};

export const DefinicoesContext = createContext<DefinicoesContextType>({
  modoEscuro: false,
  moeda: '€',
  alternarModoEscuro: () => {},
  mudarMoeda: () => {},
});

export const DefinicoesProvider = ({ children }: { children: ReactNode }) => {
  const [modoEscuro, setModoEscuro] = useState(false);
  const [moeda, setMoeda] = useState('€');

  useEffect(() => {
    const carregarDefinicoes = async () => {
      try {
        const temaGuardado = await AsyncStorage.getItem('@modoEscuro');
        const moedaGuardada = await AsyncStorage.getItem('@moeda');
        if (temaGuardado !== null) setModoEscuro(temaGuardado === 'true');
        if (moedaGuardada !== null) setMoeda(moedaGuardada);
      } catch (e) {
        console.error('Erro ao carregar definições', e);
      }
    };

    carregarDefinicoes();
  }, []);

  const alternarModoEscuro = async () => {
    try {
      await AsyncStorage.setItem('@modoEscuro', (!modoEscuro).toString());
      setModoEscuro(!modoEscuro);
    } catch (e) {
      console.error('Erro ao guardar modo escuro', e);
    }
  };

  const mudarMoeda = async (novaMoeda: string) => {
    try {
      await AsyncStorage.setItem('@moeda', novaMoeda);
      setMoeda(novaMoeda);
    } catch (e) {
      console.error('Erro ao guardar moeda', e);
    }
  };

  return (
    <DefinicoesContext.Provider value={{ modoEscuro, moeda, alternarModoEscuro, mudarMoeda }}>
      {children}
    </DefinicoesContext.Provider>
  );
};
