import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotificacoes, tempoRelativo } from '../context/NotificacoesContext';
import { colors } from '../theme';

type Props = {
  iconColor?: string;
  panelTop?:  number;
  panelRight?: number;
};

export default function NotificacoesBell({
  iconColor  = 'rgba(255,255,255,0.85)',
  panelTop   = 54,
  panelRight = 16,
}: Props) {
  const { notificacoes, limparTodas } = useNotificacoes();
  const [showPanel, setShowPanel] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // No web, position:'fixed' ignora overflow:hidden dos pais (hIconPill)
  const panelPosition = Platform.OS === 'web'
    ? ({ position: 'fixed', top: panelTop, right: panelRight } as any)
    : { position: 'absolute', top: panelTop, right: panelRight };

  return (
    <>
      {/* Botão sino */}
      <TouchableOpacity onPress={() => setShowPanel((v) => !v)} style={s.bellWrap}>
        <Ionicons
          name="notifications-outline"
          size={17}
          color={showPanel ? '#fff' : iconColor}
        />
        {notificacoes.length > 0 && <View style={s.dot} />}
      </TouchableOpacity>

      {/* Painel flutuante — usa fixed no web para escapar do overflow:hidden */}
      {showPanel && (
        <View style={[s.panel, panelPosition]}>
          <View style={s.panelHeader}>
            <Text style={s.panelTitulo}>Notificações</Text>
            <View style={s.panelHeaderRight}>
              {notificacoes.length > 0 && (
                <Text style={s.badge}>{notificacoes.length}</Text>
              )}
              <TouchableOpacity onPress={() => setShowPanel(false)}>
                <Ionicons name="close" size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={s.panelScroll} showsVerticalScrollIndicator={false}>
            {notificacoes.length === 0 ? (
              <View style={s.vazia}>
                <Ionicons name="notifications-off-outline" size={28} color="#CBD5E1" />
                <Text style={s.vaziaTxt}>Nenhuma notificação</Text>
              </View>
            ) : (
              notificacoes.slice(0, 8).map((n) => (
                <View key={n.id} style={s.item}>
                  <View style={[s.circle, { backgroundColor: n.cor }]}>
                    <Ionicons name={n.icone as any} size={14} color="#fff" />
                  </View>
                  <View style={s.textoBox}>
                    <View style={s.titleRow}>
                      <Text style={s.titulo} numberOfLines={1}>{n.titulo}</Text>
                      <Text style={s.tempo}>{tempoRelativo(n.criadaEm)}</Text>
                    </View>
                    <Text style={s.desc} numberOfLines={2}>{n.desc}</Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          <TouchableOpacity
            style={s.verTodos}
            onPress={() => { setShowPanel(false); setShowModal(true); }}
          >
            <Text style={s.verTodosTxt}>Ver todas as notificações</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modal — todas as notificações */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={s.overlay}>
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitulo}>Todas as Notificações</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={s.modalScroll} showsVerticalScrollIndicator={false}>
              {notificacoes.length === 0 ? (
                <View style={s.vazia}>
                  <Ionicons name="notifications-off-outline" size={32} color="#CBD5E1" />
                  <Text style={s.vaziaTxt}>Nenhuma notificação ainda</Text>
                </View>
              ) : (
                notificacoes.map((n) => (
                  <View key={n.id} style={s.modalItem}>
                    <View style={[s.circle, { backgroundColor: n.cor }]}>
                      <Ionicons name={n.icone as any} size={14} color="#fff" />
                    </View>
                    <View style={s.textoBox}>
                      <View style={s.titleRow}>
                        <Text style={s.titulo}>{n.titulo}</Text>
                        <Text style={s.tempo}>{tempoRelativo(n.criadaEm)}</Text>
                      </View>
                      <Text style={s.desc}>{n.desc}</Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>

            <View style={s.modalFooter}>
              {notificacoes.length > 0 && (
                <TouchableOpacity style={s.limparBtn} onPress={limparTodas}>
                  <Ionicons name="trash-outline" size={14} color="#EF4444" />
                  <Text style={s.limparTxt}>Limpar tudo</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={s.fecharBtn} onPress={() => setShowModal(false)}>
                <Text style={s.fecharTxt}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  bellWrap: { position: 'relative' },
  dot:      { position: 'absolute', top: -2, right: -2, width: 7, height: 7, borderRadius: 4, backgroundColor: '#EF4444', borderWidth: 1, borderColor: '#fff' },

  panel:           { width: 300, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#EDE9FE', shadowColor: '#5E22F3', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 18, elevation: 22, zIndex: 9999 },
  panelHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  panelHeaderRight:{ flexDirection: 'row', alignItems: 'center' },
  panelTitulo:     { fontSize: 13, fontWeight: '700', color: colors.secondary },
  badge:           { fontSize: 11, fontWeight: '700', color: '#fff', backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1, marginRight: 8 },
  panelScroll:     { maxHeight: 280 },

  item:     { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  circle:   { width: 30, height: 30, borderRadius: 15, marginRight: 10, marginTop: 1, alignItems: 'center', justifyContent: 'center' },
  textoBox: { flex: 1 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  titulo:   { fontSize: 12, fontWeight: '700', color: colors.secondary, flex: 1, marginRight: 4 },
  tempo:    { fontSize: 10, color: '#94A3B8' },
  desc:     { fontSize: 11, color: '#64748B', lineHeight: 15 },

  vazia:    { alignItems: 'center', paddingVertical: 24 },
  vaziaTxt: { fontSize: 12, color: '#94A3B8', marginTop: 6 },

  verTodos:    { paddingVertical: 10, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  verTodosTxt: { fontSize: 11, color: colors.primary, fontWeight: '700' },

  overlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard:   { backgroundColor: '#fff', borderRadius: 20, width: '100%', maxWidth: 420, maxHeight: 560, overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 22, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalTitulo: { fontSize: 16, fontWeight: '700', color: colors.secondary },
  modalScroll: { maxHeight: 380 },
  modalItem:   { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 22, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  limparBtn:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1, borderColor: '#FEE2E2', marginRight: 8 },
  limparTxt:   { fontSize: 12, color: '#EF4444', fontWeight: '600', marginLeft: 4 },
  fecharBtn:   { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 8, backgroundColor: colors.primary },
  fecharTxt:   { fontSize: 12, color: '#fff', fontWeight: '700' },
});
