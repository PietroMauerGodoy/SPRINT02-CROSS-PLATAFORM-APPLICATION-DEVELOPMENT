import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ImageBackground,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, radius } from '../theme';
import { RootStackParamList } from '../types';
import { mockUsuarios } from '../data/mockData';

import bgRoxo from '../../assets/images/backgroundroxo.png';
import logoNegativo from '../../assets/images/Motiva_Logo-Negativo.png';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: Props) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleLogin() {
    if (!usuario.trim() || !senha.trim()) {
      Alert.alert('Atenção', 'Preencha o usuário e a senha.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const encontrado = mockUsuarios.find(
        (u) => u.usuario === usuario.trim() && u.senha === senha
      );

      setLoading(false);

      if (encontrado) {
        navigation.replace('Ocorrencias');
      } else {
        Alert.alert('Erro', 'Usuário ou senha incorretos.');
      }
    }, 800);
  }

  return (
    <ImageBackground source={bgRoxo} style={styles.root} resizeMode="cover" imageStyle={styles.bgImage}>
      <StatusBar style="light" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <View style={styles.logoContainer}>
              <Image
                source={logoNegativo}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.title}>Bem vindo!</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nome de usuário</Text>
              <TextInput
                style={styles.input}
                placeholder="Usuário..."
                placeholderTextColor={colors.gray400}
                value={usuario}
                onChangeText={setUsuario}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Senha</Text>
              <TextInput
                style={styles.input}
                placeholder="Senha..."
                placeholderTextColor={colors.gray400}
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={!mostrarSenha}
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setMostrarSenha(!mostrarSenha)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, mostrarSenha && styles.checkboxChecked]}>
                {mostrarSenha && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Mostrar Senha</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              activeOpacity={0.85}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Entrando...' : 'Login'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.forgotText}>
                Esqueceu o login? Contate o suporte!
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#3D0FA8',
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  logo: {
    width: 180,
    height: 56,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
    marginBottom: spacing.sm,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.white,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 15,
    color: colors.secondary,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: colors.white,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  checkboxLabel: {
    fontSize: 13,
    color: colors.white,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  forgotText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  bgImage: {
    width: '100%',
    height: '100%',
  },
});
