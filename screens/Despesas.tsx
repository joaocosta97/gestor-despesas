import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  SectionList,
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

type Despesa = {
  id: string;
  nome: string;
  valor: string;
  categoria: string;
  data: string;
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

export default function Despesas() {
  const theme = useTheme();
  const [nome, setNome] = useState('');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('');
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [showDropDown, setShowDropDown] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const valorInputRef = useRef<any>(null);
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [mostrarPicker, setMostrarPicker] = useState(false);
  const [modalFormVisivel, setModalFormVisivel] = useState(false);
  const [mesesAbertos, setMesesAbertos] = useState<string[]>([]);

  const toggleMesAberto = (mesAno: string) => {
    if (mesesAbertos.includes(mesAno)) {
      setMesesAbertos(mesesAbertos.filter((m) => m !== mesAno));
    } else {
      setMesesAbertos([...mesesAbertos, mesAno]);
    }
  };

  const calcularTotalMesAtual = () => {
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    return despesas.reduce((soma, despesa) => {
      const dataDespesa = new Date(despesa.data);
      if (dataDespesa.getMonth() === mesAtual && dataDespesa.getFullYear() === anoAtual) {
        const valorNumerico = parseFloat(despesa.valor.replace(',', '.'));
        return soma + (isNaN(valorNumerico) ? 0 : valorNumerico);
      }
      return soma;
    }, 0);
  };

  const adicionarDespesa = () => {
    if (nome && valor && categoria) {
      const novaDespesa: Despesa = {
        id: Date.now().toString(),
        nome,
        valor,
        categoria,
        data: new Date(data).toISOString(),
      };

      const novaLista = [...despesas, novaDespesa];
      setDespesas(novaLista);
      guardarDespesas(novaLista);
      setNome('');
      setValor('');
      setCategoria('');
      setModalFormVisivel(false);
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
    const hoje = new Date();
    const tituloAtual = hoje.toLocaleString('default', { month: 'long', year: 'numeric' });
    setMesesAbertos([tituloAtual]);
  }, [despesas]);

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

  const agruparDespesasPorMes = () => {
    const agrupadas: { [chave: string]: Despesa[] } = {};

    despesas.forEach((despesa) => {
      const dataObj = new Date(despesa.data);
      const ano = dataObj.getFullYear();
      const mes = (dataObj.getMonth() + 1).toString().padStart(2, '0');
      const chave = `${ano}-${mes}`;

      if (!agrupadas[chave]) {
        agrupadas[chave] = [];
      }
      agrupadas[chave].unshift(despesa);
    });

    return Object.keys(agrupadas)
      .sort((a, b) => b.localeCompare(a))
      .map((chave) => {
        const [ano, mes] = chave.split('-');
        const dataFormatada = new Date(`${ano}-${mes}-01`);
        const titulo = dataFormatada.toLocaleString('default', { month: 'long', year: 'numeric' });
        return {
          title: titulo,
          data: agrupadas[chave],
        };
      });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.titulo, { color: theme.colors.primary }]}>Gestor de Despesas</Text>
      <Text style={[styles.total, { color: theme.colors.onBackground }]}>
        Total deste mês: {calcularTotalMesAtual().toFixed(2)} €
      </Text>

      <SectionList
        sections={agruparDespesasPorMes().map((section) => ({
          ...section,
          data: mesesAbertos.includes(section.title) ? section.data : [],
        }))}
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
                    <Text style={[styles.itemNome, { color: theme.colors.onSurface }]}>{item.nome}</Text>
                  </View>
                  <Text style={[styles.itemValor, { color: theme.colors.onSurface }]}>{item.valor} €</Text>
                </View>
                <Button onPress={() => removerDespesa(item.id)} compact>
                  🗑️
                </Button>
              </Card.Content>
            </Card>
          );
        }}
        renderSectionHeader={({ section: { title } }) => {
          const aberto = mesesAbertos.includes(title);

          return (
            <Pressable onPress={() => toggleMesAberto(title)}>
              <View style={styles.headerMes}>
                <Text style={styles.separadorMes}>{title.toUpperCase()}</Text>
                <MaterialCommunityIcons
                  name={aberto ? 'chevron-up' : 'chevron-down'}
                  size={24}
                  color={theme.colors.primary}
                  style={{ marginLeft: 8 }}
                />
              </View>
            </Pressable>
          );
        }}
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
              label="Despesa"
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
              onSubmitEditing={adicionarDespesa}
              mode="outlined"
              outlineColor={theme.colors.primary}
              activeOutlineColor={theme.colors.primary}
              textColor={theme.colors.onSurface}
            />

            <Pressable style={styles.pressableCampo} onPress={() => setShowDropDown(true)}>
              <Text style={styles.pressableTexto}>
                {categoria ? `• ${categoria}` : 'Escolhe uma categoria'}
              </Text>
            </Pressable>

            {/* Calendário */}
            {Platform.OS === 'web' ? (
              <View style={{ width: '100%', marginBottom: 12, alignItems: 'center' }}>
                <Pressable style={styles.pressableCampo} onPress={() => setMostrarPicker(true)}>
                  <Text style={styles.pressableTexto}>📅 {data}</Text>
                </Pressable>
                {mostrarPicker && (
                  <DatePicker
                    selected={new Date(data)}
                    onChange={(date) => {
                      if (date) {
                        setData(date.toISOString().split('T')[0]);
                        setMostrarPicker(false);
                      }
                    }}
                    inline
                    maxDate={new Date()}
                    dateFormat="yyyy-MM-dd"
                  />
                )}
              </View>
            ) : (
              <>
                <Pressable style={styles.pressableCampo} onPress={() => setMostrarPicker(true)}>
                  <Text style={styles.pressableTexto}>📅 {data}</Text>
                </Pressable>
                {mostrarPicker && (
                  <DateTimePicker
                    value={new Date(data)}
                    mode="date"
                    display="default"
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

            <Button mode="contained" onPress={adicionarDespesa} style={styles.botao}>
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
    marginTop: 12,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  total: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
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
  },
  iconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerMes: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  separadorMes: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 12,
    textAlign: 'center',
    borderRadius: 8,
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
    backgroundColor: '#ffffff',
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
  dropdownText: {
    fontSize: 16,
  },

  botao: {
    backgroundColor: '#5e35b1',
    marginTop: 16,
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

