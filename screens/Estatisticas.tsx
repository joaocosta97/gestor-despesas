import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useFocusEffect } from '@react-navigation/native';

type Despesa = {
  id: string;
  nome: string;
  valor: string;
  categoria: string;
  data: string;
};

export default function Estatisticas() {
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [filtroPeriodo, setFiltroPeriodo] = useState<'mesAtual' | '30dias' | '60dias' | 'sempre'>('mesAtual');

  const carregarDespesas = async () => {
    try {
      const dados = await AsyncStorage.getItem('@despesas');
      if (dados) {
        setDespesas(JSON.parse(dados));
      }
    } catch (e) {
      console.error('Erro ao carregar despesas', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarDespesas();
    }, [])
  );

  const calcularTotais = () => {
    const hoje = new Date();
    let dataInicioFiltro: Date;

    if (filtroPeriodo === 'mesAtual') {
      dataInicioFiltro = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    } else if (filtroPeriodo === '30dias') {
      dataInicioFiltro = new Date();
      dataInicioFiltro.setDate(hoje.getDate() - 30);
    } else if (filtroPeriodo === '60dias') {
      dataInicioFiltro = new Date();
      dataInicioFiltro.setDate(hoje.getDate() - 60);
    } else {
      dataInicioFiltro = new Date(2000, 0, 1);
    }

    let totalPeriodo = 0;
    const porCategoria: { [key: string]: number } = {};
    const porMes: { [key: string]: number } = {};

    despesas.forEach((d) => {
      const dataDespesa = new Date(d.data);
      const valor = parseFloat(d.valor.replace(',', '.')) || 0;

      if (dataDespesa >= dataInicioFiltro && dataDespesa <= hoje) {
        totalPeriodo += valor;

        porCategoria[d.categoria] = (porCategoria[d.categoria] || 0) + valor;

        const mesAno = `${dataDespesa.toLocaleString('default', { month: 'short' })}/${dataDespesa.getFullYear()}`;
        porMes[mesAno] = (porMes[mesAno] || 0) + valor;
      }
    });

    return { totalPeriodo, porCategoria, porMes };
  };

  const { totalPeriodo, porCategoria, porMes } = calcularTotais();

  const dataCategorias = Object.keys(porCategoria).map((key) => ({
    name: key,
    value: porCategoria[key]
  }));

  const dataMeses = Object.keys(porMes).map((key) => ({
    mes: key,
    valor: porMes[key]
  })).sort((a, b) => new Date(`01 ${a.mes}`) > new Date(`01 ${b.mes}`) ? 1 : -1);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>📊 Estatísticas</Text>

      <View style={styles.filtrosContainer}>
        <Pressable style={styles.botaoFiltro} onPress={() => setFiltroPeriodo('mesAtual')}>
          <Text style={styles.textoBotaoFiltro}>Mês Atual</Text>
        </Pressable>
        <Pressable style={styles.botaoFiltro} onPress={() => setFiltroPeriodo('30dias')}>
          <Text style={styles.textoBotaoFiltro}>Últimos 30 dias</Text>
        </Pressable>
        <Pressable style={styles.botaoFiltro} onPress={() => setFiltroPeriodo('60dias')}>
          <Text style={styles.textoBotaoFiltro}>Últimos 60 dias</Text>
        </Pressable>
        <Pressable style={styles.botaoFiltro} onPress={() => setFiltroPeriodo('sempre')}>
          <Text style={styles.textoBotaoFiltro}>Desde Sempre</Text>
        </Pressable>
      </View>

      <View style={styles.cardResumo}>
        <Text style={styles.textoResumo}>Total: {totalPeriodo.toFixed(2)} €</Text>
      </View>

      <Text style={styles.subtitulo}>Por Categoria:</Text>
      <View style={styles.graficoContainer}>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={dataCategorias}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#5e35b1"
              label
            >
              {dataCategorias.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={['#5e35b1', '#7e57c2', '#9575cd', '#b39ddb', '#d1c4e9'][index % 5]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </View>

      <Text style={styles.subtitulo}>Por Mês:</Text>
      <View style={styles.graficoContainer}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dataMeses}>
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="valor" fill="#5e35b1" />
          </BarChart>
        </ResponsiveContainer>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#5e35b1',
  },
  filtrosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  botaoFiltro: {
    backgroundColor: '#ede7f6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    margin: 4,
  },
  textoBotaoFiltro: {
    color: '#5e35b1',
    fontSize: 14,
  },
  cardResumo: {
    backgroundColor: '#ede7f6',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  textoResumo: {
    fontSize: 18,
    textAlign: 'center',
    color: '#333',
    marginVertical: 5,
  },
  subtitulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
    color: '#5e35b1',
  },
  graficoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
});
