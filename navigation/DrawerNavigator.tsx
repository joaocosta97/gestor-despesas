import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import Despesas from '../screens/Despesas';
import Planeador from '../screens/Planeador';
import Estatisticas from '../screens/Estatisticas';
import Definicoes from '../screens/Definicoes';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName="Despesas">
        <Drawer.Screen name="Despesas" component={Despesas} />
        <Drawer.Screen name="Planeador" component={Planeador} />
        <Drawer.Screen name="Estatísticas" component={Estatisticas} />
        <Drawer.Screen name="Definições" component={Definicoes} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
