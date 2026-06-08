import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing } from '../theme';
import { RootStackParamList } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Ocorrencias'>;
};

export default function OcorrenciasScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Lista de Ocorrências</Text>
      <Text style={styles.sub}>Em construção — próxima sprint</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  text: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.secondary,
  },
  sub: {
    fontSize: 14,
    color: colors.gray400,
    marginTop: spacing.sm,
  },
});
