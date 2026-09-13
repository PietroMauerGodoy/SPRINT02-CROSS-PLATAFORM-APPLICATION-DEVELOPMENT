import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EstadoSincronizacao } from '../../types';
import { useKanban } from '../../context/KanbanContext';
import { useNotificacoes } from '../../context/NotificacoesContext';
import { buscarLeiturasSensor } from '../../services/sensoresService';
import { agregarLeiturasPorMenorValor } from '../../utils/agregacaoSensores';

// Volta pra "idle" automaticamente depois de mostrar sucesso/erro, pra não
// exigir que o usuário feche/dispense nada — o botão já reflete o resultado
// visualmente por 1.2s e depois libera pra uma nova sincronização.
const DURACAO_FEEDBACK_MS = 1200;

const ESTADO_VISUAL: Record<EstadoSincronizacao, { icone: keyof typeof Ionicons.glyphMap; cor: string; texto: string | null }> = {
  idle:          { icone: 'sync-outline',         cor: '#fff',     texto: 'Atualizar'    },
  sincronizando: { icone: 'sync-outline',         cor: '#fff',     texto: 'Atualizando...' },
  sucesso:       { icone: 'checkmark',            cor: '#10B981',  texto: null            },
  erro:          { icone: 'alert-circle-outline', cor: '#EF4444',  texto: null            },
};

/**
 * Gate de RBAC (só Admin/Gestor) é decidido por quem monta este componente
 * (KanbanScreen, via a mesma `podeCriarOuExcluirKanbanItem` já usada no resto
 * da tela) — este componente não conhece papel de usuário, só sincroniza.
 */
export default function BotaoAtualizarSincronizacao() {
  const { aplicarLeiturasSensor } = useKanban();
  const { adicionarNotificacao } = useNotificacoes();
  const [estado, setEstado] = useState<EstadoSincronizacao>('idle');
  const rotacao = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (estado === 'sincronizando') {
      rotacao.setValue(0);
      loopRef.current = Animated.loop(
        Animated.timing(rotacao, { toValue: 1, duration: 800, easing: Easing.linear, useNativeDriver: true }),
      );
      loopRef.current.start();
    } else {
      loopRef.current?.stop();
      rotacao.setValue(0);
    }
    return () => loopRef.current?.stop();
  }, [estado, rotacao]);

  async function sincronizar() {
    if (estado !== 'idle') return;
    setEstado('sincronizando');
    try {
      const leituras = await buscarLeiturasSensor();
      const agregadas = agregarLeiturasPorMenorValor(leituras);
      const quantidade = aplicarLeiturasSensor(agregadas);
      setEstado('sucesso');
      adicionarNotificacao({
        cor: '#10B981', icone: 'hardware-chip-outline',
        titulo: 'Sensores sincronizados',
        desc: quantidade > 0
          ? `${quantidade} card${quantidade === 1 ? '' : 's'} do Kanban atualizado${quantidade === 1 ? '' : 's'} com leituras dos sensores.`
          : 'Sincronização concluída, mas nenhuma leitura correspondeu a um trecho do Kanban.',
      });
    } catch {
      setEstado('erro');
    } finally {
      setTimeout(() => setEstado('idle'), DURACAO_FEEDBACK_MS);
    }
  }

  const visual = ESTADO_VISUAL[estado];
  const rotacaoInterpolada = rotacao.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <TouchableOpacity
      style={s.botao}
      onPress={sincronizar}
      disabled={estado === 'sincronizando'}
    >
      <Animated.View style={estado === 'sincronizando' ? { transform: [{ rotate: rotacaoInterpolada }] } : undefined}>
        <Ionicons name={visual.icone} size={15} color={visual.cor} />
      </Animated.View>
      {visual.texto && <Text style={s.texto}>{visual.texto}</Text>}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  botao: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7,
  },
  texto: { fontSize: 13, color: '#fff', fontWeight: '600' },
});
