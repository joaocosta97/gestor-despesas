import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Modal,
  Pressable,
  Animated,
  TouchableOpacity,
} from 'react-native';
import {
  Provider as PaperProvider,
  Text,
  TextInput,
  Button,
  Card,
  DefaultTheme,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#5e35b1',
    onPrimary: '#ffffff',
    background: '#ffffff',
    surfaceVariant: '#ede7f6',
    outline: '#ccc',
  },
};

type Despesa = {
  id: string;
  nome: string;
  valor: string;
  categoria: string;
};

const listaCategorias = [
  { label: 'Alimentação', icon: 'food' },
  { label: 'Transporte', icon: 'car' },
  { label: 'Saúde', icon: 'heart' },
  { label: 'Lazer', icon: 'gamepad-variant' },
  { label: 'Educação', icon: 'school' },
  { label: 'Casa', icon: 'home' },
  { label: 'Subscrições', icon: 'youtube-subscription' },
  { label: 'Outros', icon: 'dots-horizontal' },
];

export default function App() {
  const [nome, setNome] = useState('');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('');
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [showDropDown, setShowDropDown] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const valorInputRef = useRef<any>(null);

  const total = despesas.reduce((soma, despesa) => {
    const valorNumerico = parseFloat(despesa.valor.replace(',', '.'));
    return soma + (isNaN(valorNumerico) ? 0 : valorNumerico);
  }, 0);

  const adicionarDespesa = () => {
    if (nome && valor && categoria) {
      const novaDespesa: Despesa = {
        id: Date.now().toString(),
        nome,
        valor,
        categoria,
      };

      const novaLista = [...despesas, novaDespesa];
      setDespesas(novaLista);
      guardarDespesas(novaLista);
      setNome('');
      setValor('');
      setCategoria('');
    }
  };

  const removerDespesa = (id: string) => {
    const novaLista = despesas.filter((d) => d.id !== id);
    setDespesas(novaLista);
    guardarDespesas(novaLista);
  };

  const guardarDespesas = async (dados: Despesa[]) => {
    try {
      await AsyncStorage.setItem('@despesas', JSON.stringify(dados));
    } catch (e) {
      console.error('Erro ao guardar despesas', e);
    }
  };

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

  useEffect(() => {
    carregarDespesas();
  }, []);

  useEffect(() => {
    if (showDropDown) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [showDropDown]);

  const obterIcon = (categoria: string) => {
    const cat = listaCategorias.find((c) => c.label === categoria);
    return cat?.icon || 'tag';
  };

  return (
    <PaperProvider theme={theme}>
      <View style={styles.container}>
        <Text style={styles.titulo}>Gestor de Despesas</Text>
        <Text style={styles.total}>Total: {total.toFixed(2)} €</Text>

        <TextInput
          label="Despesa"
          value={nome}
          onChangeText={setNome}
          style={styles.input}
          returnKeyType="next"
          onSubmitEditing={() => valorInputRef.current?.focus()}
        />

        <TextInput
          label="Valor (€)"
          value={valor}
          onChangeText={(text) => {
            const valorFiltrado = text.replace(/[^0-9.,]/g, '');
            setValor(valorFiltrado);
          }}
          keyboardType="numeric"
          style={styles.input}
          ref={valorInputRef}
          returnKeyType="done"
          onSubmitEditing={adicionarDespesa}
        />

        <Pressable style={styles.input} onPress={() => setShowDropDown(true)}>
          <Text style={styles.dropdownText}>
            {categoria ? `• ${categoria}` : 'Escolhe uma categoria'}
          </Text>
        </Pressable>

        <Modal visible={showDropDown} transparent animationType="none">
          <View style={styles.modalOverlay}>
            <Animated.View style={[styles.modalContent, { opacity: fadeAnim }]}>
              <Text style={styles.modalTitle}>Escolhe uma categoria</Text>
              <View style={styles.grid}>
                {listaCategorias.map((item) => (
                  <TouchableOpacity
                    key={item.label}
                    style={styles.categoriaBotao}
                    onPress={() => {
                      setCategoria(item.label);
                      setShowDropDown(false);
                    }}
                  >
                    <MaterialCommunityIcons name={item.icon as any} size={44} color="#5e35b1" />
                    <Text style={styles.categoriaTexto}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Button onPress={() => setShowDropDown(false)} style={{ marginTop: 16 }}>
                Cancelar
              </Button>
            </Animated.View>
          </View>
        </Modal>

        <Button mode="contained" onPress={adicionarDespesa} style={styles.botao}>
          Adicionar
        </Button>

        <FlatList
          data={despesas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const categoriaInfo = listaCategorias.find((cat) => cat.label === item.categoria);
            return (
              <Card style={styles.card}>
                <Card.Content style={styles.cardContent}>
                  <View style={styles.cardLeft}>
                    <View style={styles.iconLabel}>
                      {categoriaInfo && (
                        <MaterialCommunityIcons
                          name={categoriaInfo.icon as any}
                          size={22}
                          color="#5e35b1"
                          style={{ marginRight: 8 }}
                        />
                      )}
                      <Text style={styles.itemNome}>{item.nome}</Text>
                    </View>
                    <Text style={styles.itemValor}>{item.valor} €</Text>
                  </View>
                  <Button onPress={() => removerDespesa(item.id)} compact>
                    🗑️
                  </Button>
                </Card.Content>
              </Card>
            );
          }}
        />
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#fff',
  },
  titulo: {
    fontSize: 30,
    marginBottom: 8,
    marginTop: 12,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#5e35b1',
  },
  total: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
    color: '#555',
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#ede7f6',
    padding: 12,
    borderRadius: 6,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  botao: {
    marginBottom: 24,
    backgroundColor: '#5e35b1',
  },
  card: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeft: {
    flexDirection: 'column',
    flex: 1,
  },
  itemNome: {
    fontSize: 18,
    color: '#333',
  },
  itemValor: {
    fontSize: 16,
    color: '#666',
  },
  iconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoria: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#5e35b1',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  categoriaBotao: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ede7f6',
    padding: 10,
    borderRadius: 8,
    margin: 6,
    width: 100,
    height: 100,
  },
  categoriaTexto: {
    marginTop: 6,
    fontSize: 14,
    color: '#5e35b1',
    textAlign: 'center',
  },
});
