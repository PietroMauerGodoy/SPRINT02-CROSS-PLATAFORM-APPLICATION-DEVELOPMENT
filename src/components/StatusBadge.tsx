import { View, Text, StyleSheet } from 'react-native';
import { StatusEquipe } from '../types';

const CONFIG: Record<StatusEquipe, { label: string; dot: string; bg: string; text: string }> = {
  ativo:    { label: 'Ativo',    dot: '#22C55E', bg: '#DCFCE7', text: '#15803D' },
  inativo:  { label: 'Inativo',  dot: '#94A3B8', bg: '#F1F5F9', text: '#475569' },
  em_campo: { label: 'Em Campo', dot: '#F59E0B', bg: '#FEF3C7', text: '#B45309' },
};

type Props = { status: StatusEquipe };

export default function StatusBadge({ status }: Props) {
  const c = CONFIG[status];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <View style={[styles.dot, { backgroundColor: c.dot }]} />
      <Text style={[styles.text, { color: c.text }]}>{c.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    gap: 5,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});
