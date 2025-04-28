import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  FlatList,
  Modal,
  Pressable,
  Animated,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from 'react-native';
import { Text, TextInput, Button, Card, useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { differenceInDays } from 'date-fns';

type Planeamento = {
  id: string;
  nome: string;
  valor: string;
  categoria: string;
  data: string;
};

const listaCategorias = [
  { label: 'Casa', icon: 'home' },
  { label: 'Subscrição', icon: 'youtube-subscription' },
  { label: 'Fatura', icon: 'file-document' },
  { label: 'Renda', icon: 'home-city' },
  { label: 'Transporte', icon: 'car' },
  { label: 'Educação', icon: 'school' },
  { label: 'Lazer', icon: 'beach' },
  { label: 'Viagem', icon: 'airplane' },
  { label: 'Serviços', icon: 'tools' },
  { label: 'Impostos', icon: 'currency-usd' },
  { label: 'Outro', icon: 'dots-horizontal' },
];

const tempoRestante = (data: string) => {
  const dias = differenceInDays(new Date(data), new Date());
  if (dias === 0) return 'Hoje';
  if (dias === 1) return 'Amanhã';
  if (dias > 1) return `Em ${dias} dias`;
  return 'Data inválida';
};

export default function Planeador() {
  const theme = useTheme();
  const [nome, setNome] = useState('');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('');
  const [planeamentos, setPlaneamentos] = useState<Planeamento[]>([]);
  const [showDropDown, setShowDropDown] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const valorInputRef = useRef<any>(null);
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [mostrarPicker, setMostrarPicker] = useState(false);
  const [modalFormVisivel, setModalFormVisivel] = useState(false);

  const adicionarPlaneamento = () => {
    if (nome && valor && categoria) {
      const novoPlaneamento: Planeamento = {
        id: Date.now().toString(),
        nome,
        valor,
        categoria,
        data: new Date(data).toISOString(),
      };

      const novaLista = [...planeamentos, novoPlaneamento];
      guardarPlaneamentos(novaLista);
      setNome('');
      setValor('');
      setCategoria('');
      setModalFormVisivel(false);
    }
  };

  const removerPlaneamento = (id: string) => {
    const novaLista = planeamentos.filter((p) => p.id !== id);
    guardarPlaneamentos(novaLista);
  };

  const guardarPlaneamentos = async (dados: Planeamento[]) => {
    try {
      await AsyncStorage.setItem('@planeamentos', JSON.stringify(dados));
      setPlaneamentos(dados);
    } catch (e) {
      console.error('Erro ao guardar planeamentos', e);
    }
  };

  const carregarPlaneamentos = async () => {
    try {
      const dados = await AsyncStorage.getItem('@planeamentos');
      if (dados) {
        setPlaneamentos(JSON.parse(dados));
      }
    } catch (e) {
      console.error('Erro ao carregar planeamentos', e);
    }
  };

  useEffect(() => {
    carregarPlaneamentos();
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

  const planeamentosOrdenados = planeamentos
    .slice()
    .sort((a, b) => differenceInDays(new Date(a.data), new Date()) - differenceInDays(new Date(b.data), new Date()));

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.titulo, { color: theme.colors.primary }]}>Planeador de Pagamentos</Text>

      <FlatList
        data={planeamentosOrdenados}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const categoriaInfo = listaCategorias.find((cat) => cat.label === item.categoria);
          return (
            <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Card.Content style={styles.cardContent}>
                <View style={styles.cardLeft}>
                  <View style={styles.iconLabel}>
                    {categoriaInfo && (
                      <MaterialCommunityIcons
                        name={categoriaInfo.icon as any}
                        size={22}
                        color={theme.colors.primary}
                        style={{ marginRight: 8 }}
                      />
                    )}
                    <View>
                      <Text style={[styles.itemNome, { color: theme.colors.onSurface }]}>{item.nome}</Text>
                      <Text style={[styles.tempoRestante, { color: theme.colors.onSurface }]}>
                        {tempoRestante(item.data)}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.itemValor, { color: theme.colors.onSurface }]}>{item.valor} €</Text>
                </View>
                <Button onPress={() => removerPlaneamento(item.id)} compact>
                  🗑️
                </Button>
              </Card.Content>
            </Card>
          );
        }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40, color: theme.colors.onSurface }}>Sem pagamentos planeados.</Text>}
      />

      {/* Botão Flutuante */}
      <Pressable style={styles.botaoFlutuante} onPress={() => setModalFormVisivel(true)}>
        <Text style={styles.botaoFlutuanteTexto}>+</Text>
      </Pressable>

      {/* Modal Formulário */}
      <Modal
        visible={modalFormVisivel}
        transparent
        animationType="slide"
        onRequestClose={() => setModalFormVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalFormContent, { backgroundColor: theme.colors.surface }]}>
            <TextInput
              label="Pagamento"
              value={nome}
              onChangeText={setNome}
              style={styles.input}
              returnKeyType="next"
              onSubmitEditing={() => valorInputRef.current?.focus()}
              mode="outlined"
              outlineColor={theme.colors.primary}
              activeOutlineColor={theme.colors.primary}
              textColor={theme.colors.onSurface}
            />

            <TextInput
              label="Valor (€)"
              value={valor}
              onChangeText={(text) => setValor(text.replace(/[^0-9.,]/g, ''))}
              keyboardType="decimal-pad"
              style={styles.input}
              ref={valorInputRef}
              returnKeyType="done"
              onSubmitEditing={adicionarPlaneamento}
              mode="outlined"
              outlineColor={theme.colors.primary}
              activeOutlineColor={theme.colors.primary}
              textColor={theme.colors.onSurface}
            />

            <Pressable style={styles.pressableCampo} onPress={() => setShowDropDown(true)}>
              <Text style={{ color: theme.colors.onSurface }}>
                {categoria ? `• ${categoria}` : 'Escolhe uma categoria'}
              </Text>
            </Pressable>

            {Platform.OS === 'web' ? (
              <View style={{ width: '100%', marginBottom: 12, alignItems: 'center' }}>
                <Pressable style={styles.pressableCampo} onPress={() => setMostrarPicker(true)}>
                  <Text style={styles.pressableTexto}>📅 {data}</Text>
                </Pressable>
                {mostrarPicker && (
                  <DatePicker
                    selected={new Date(data)}
                    onChange={(date) => {
                      if (date && date >= new Date()) {
                        setData(date.toISOString().split('T')[0]);
                        setMostrarPicker(false);
                      }
                    }}
                    inline
                    minDate={new Date()}
                    dateFormat="yyyy-MM-dd"
                  />
                )}
              </View>
            ) : (
              <>
                <Pressable style={styles.pressableCampo} onPress={() => setMostrarPicker(true)}>
                  <Text style={{ color: theme.colors.onSurface }}>📅 {data}</Text>
                </Pressable>
                {mostrarPicker && (
                  <DateTimePicker
                    value={new Date(data)}
                    mode="date"
                    display="default"
                    minimumDate={new Date()}
                    onChange={(event, selectedDate) => {
                      setMostrarPicker(false);
                      if (selectedDate) {
                        setData(selectedDate.toISOString().split('T')[0]);
                      }
                    }}
                  />
                )}
              </>
            )}

            <Button mode="contained" onPress={adicionarPlaneamento} style={styles.botao}>
              Adicionar
            </Button>
            <Button mode="outlined" onPress={() => setModalFormVisivel(false)} style={{ marginTop: 8 }}>
              Cancelar
            </Button>
          </View>
        </View>
      </Modal>

      {/* Modal Categorias */}
      <Modal visible={showDropDown} transparent animationType="none">
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContent, { opacity: fadeAnim, backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.primary }]}>Escolhe uma categoria</Text>
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
                  <MaterialCommunityIcons name={item.icon as any} size={44} color={theme.colors.primary} />
                  <Text style={{ color: theme.colors.onSurface, marginTop: 6, fontSize: 14, textAlign: 'center' }}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Button onPress={() => setShowDropDown(false)} style={{ marginTop: 16 }}>
              Cancelar
            </Button>
          </Animated.View>
        </View>
      </Modal>
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
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 12,
    backgroundColor: '#ffffff', // este valor adapta-se pelo theme
    borderRadius: 16,
    elevation: 4, // Android: sombra
    shadowColor: '#000', // iOS/Web: sombra
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  },
  itemValor: {
    fontSize: 16,
    marginTop: 6,
  },
  tempoRestante: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  iconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  botaoFlutuante: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#6C63FF', // igual à Primary Color
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  botaoFlutuanteTexto: {
    color: '#fff',
    fontSize: 34,
    fontWeight: 'bold',
  },  
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalFormContent: {
    backgroundColor: '#ffffff', // o Theme já vai adaptar isto
    padding: 24,
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
    alignSelf: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#ede7f6',
    fontSize: 16,
    borderRadius: 10,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
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
  botao: {
    marginTop: 16,
    backgroundColor: '#5e35b1',
  },
  pressableCampo: {
    backgroundColor: '#ede7f6',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 6,
    justifyContent: 'center',
    marginBottom: 12,
    height: 56,
  },
  
  pressableTexto: {
    fontSize: 16,
    color: '#333',
  },
  
});
