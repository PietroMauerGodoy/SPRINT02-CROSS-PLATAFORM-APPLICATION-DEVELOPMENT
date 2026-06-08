import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';

const logoNegativo = require('../../assets/images/Motiva_Logo-Negativo.png');
const perfilLogo   = require('../../assets/images/perfil_logo.png');

type Props = {
  onMenuPress?: () => void;
};

export default function AppHeader({ onMenuPress }: Props) {
  return (
    <View style={styles.header}>
      {/* Lado esquerdo: logo + menu */}
      <View style={styles.left}>
        <Image source={logoNegativo} style={styles.logo} resizeMode="contain" />
        <TouchableOpacity onPress={onMenuPress} style={styles.menuBtn}>
          <Ionicons name="menu" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Lado direito: ações */}
      <View style={styles.right}>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="sunny-outline" size={20} color={colors.white} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="notifications-outline" size={20} color={colors.white} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="settings-outline" size={20} color={colors.white} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn}>
          <MaterialIcons name="logout" size={20} color={colors.white} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.avatarBtn}>
          <Image source={perfilLogo} style={styles.avatar} resizeMode="cover" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  logo: {
    width: 110,
    height: 32,
  },
  menuBtn: {
    padding: spacing.xs,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.primary,
    marginLeft: spacing.xs,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
});
