import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Definicoes() {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Definições</Text>
      <Text style={styles.texto}>Aqui vais poder configurar a app ao teu gosto!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#5e35b1',
  },
  texto: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
});
