import React, { useContext } from 'react';
import { View, StyleSheet, Alert, Switch } from 'react-native';
import { Text, Button, RadioButton, useTheme } from 'react-native-paper';
import { DefinicoesContext } from '../DefinicoesContext'; // Ajusta o caminho conforme onde tens o ficheiro
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Definicoes() {
  const theme = useTheme();
  const { modoEscuro, moeda, alternarModoEscuro, mudarMoeda } = useContext(DefinicoesContext) as {
    modoEscuro: boolean;
    moeda: string;
    alternarModoEscuro: () => void;
    mudarMoeda: (novaMoeda: string) => void;
  };

  const limparDados = async () => {
    Alert.alert(
      'Apagar Todos os Dados',
      'Tens a certeza que queres apagar todas as despesas e planeamentos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('@despesas');
              await AsyncStorage.removeItem('@planeamentos');
              Alert.alert('Dados apagados com sucesso!');
            } catch (e) {
              console.error('Erro ao apagar dados', e);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.titulo, { color: theme.colors.primary }]}>Definições</Text>

      {/* Tema */}
      <View style={styles.seccao}>
        <Text style={[styles.subtitulo, { color: theme.colors.onBackground }]}>Modo Claro / Escuro</Text>
        <View style={styles.linha}>
          <Text style={[styles.label, { color: theme.colors.onBackground }]}>
            {modoEscuro ? 'Modo Escuro 🌙' : 'Modo Claro ☀️'}
          </Text>
          <Switch
            value={modoEscuro}
            onValueChange={alternarModoEscuro}
            thumbColor="#5e35b1"
          />
        </View>
      </View>

      {/* Moeda */}
      <View style={styles.seccao}>
        <Text style={[styles.subtitulo, { color: theme.colors.onBackground }]}>Moeda</Text>
        <RadioButton.Group onValueChange={mudarMoeda} value={moeda}>
          <View style={styles.linha}>
            <RadioButton value="€" />
            <Text style={[styles.label, { color: theme.colors.onBackground }]}>Euro (€)</Text>
          </View>
          <View style={styles.linha}>
            <RadioButton value="$" />
            <Text style={[styles.label, { color: theme.colors.onBackground }]}>Dólar ($)</Text>
          </View>
          <View style={styles.linha}>
            <RadioButton value="£" />
            <Text style={[styles.label, { color: theme.colors.onBackground }]}>Libra (£)</Text>
          </View>
        </RadioButton.Group>
      </View>

      {/* Limpar Dados */}
      <View style={styles.seccao}>
        <Text style={[styles.subtitulo, { color: theme.colors.onBackground }]}>Controlo de Dados</Text>
        <Button
          mode="contained"
          style={[styles.botao, { backgroundColor: theme.colors.error }]}
          onPress={limparDados}
        >
          Apagar Todos os Dados
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 50,
  },
  titulo: {
    fontSize: 30,
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  seccao: {
    marginBottom: 32,
  },
  subtitulo: {
    fontSize: 20,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    marginLeft: 8,
  },
  botao: {
    marginTop: 12,
  },
});
