import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { NotificacoesProvider } from './src/context/NotificacoesContext';
import { EquipesProvider } from './src/context/EquipesContext';
import { KanbanProvider } from './src/context/KanbanContext';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <NotificacoesProvider>
        <EquipesProvider>
          <KanbanProvider>
            <AppNavigator />
          </KanbanProvider>
        </EquipesProvider>
      </NotificacoesProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
