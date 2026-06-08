import { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  ScrollView,
  Image,
  Modal,
  Alert,
  ImageBackground,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import StatusBadge from '../components/StatusBadge';
import { colors } from '../theme';
import { Equipe, RootStackParamList, StatusEquipe } from '../types';
import { mockEquipes } from '../data/mockData';

import bgRoxo     from '../../assets/images/backgroundroxo.png';
import bgBranca   from '../../assets/images/backgroundbranca.png';
import logoNeg    from '../../assets/images/Motiva_Logo-Negativo.png';
import perfilLogo from '../../assets/images/perfil_logo.png';
import perfilEq   from '../../assets/images/perfil_equipe.jpg';

const ITENS_POR_PAGINA = 7;
const RODOVIAS = ['Todas', 'BR-116', 'BR-381', 'SP-280'];

const NOTIFICACOES = [
  { id: 1, cor: '#F59E0B', titulo: 'Equipe inativa',      desc: 'Equipe #03 está inativa há mais de 3 dias sem justificativa.',   tempo: '5 min atrás' },
  { id: 2, cor: '#3B82F6', titulo: 'Nova equipe criada',  desc: 'Equipe #11 foi cadastrada e está pronta para receber atribuições.', tempo: '1h atrás'   },
  { id: 3, cor: '#F97316', titulo: 'Equipe em campo',     desc: 'Equipe #06 registrou entrada no trecho BR-116 Km 55.',           tempo: '2h atrás'    },
  { id: 4, cor: '#8B5CF6', titulo: 'Relatório disponível',desc: 'O relatório semanal de operações foi gerado e está disponível.',  tempo: '1 dia atrás' },
];
const STATUS_OPTS: { label: string; value: StatusEquipe | 'todas' }[] = [
  { label: 'Todas',    value: 'todas'    },
  { label: 'Ativo',    value: 'ativo'    },
  { label: 'Inativo',  value: 'inativo'  },
  { label: 'Em Campo', value: 'em_campo' },
];

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Equipes'>;
};

export default function EquipesScreen({ navigation }: Props) {
  const [equipes, setEquipes]              = useState<Equipe[]>(mockEquipes);
  const [busca, setBusca]                  = useState('');
  const [rodoviaFiltro, setRodoviaFiltro]  = useState('Todas');
  const [statusFiltro, setStatusFiltro]    = useState<StatusEquipe | 'todas'>('todas');
  const [pagina, setPagina]                = useState(1);
  const [dropRodovia, setDropRodovia]      = useState(false);
  const [dropStatus, setDropStatus]        = useState(false);
  const [modalCriar, setModalCriar]        = useState(false);
  const [equipeEditando, setEquipeEditando] = useState<Equipe | null>(null);
  const [sidebarAberta, setSidebarAberta]  = useState(true);
  const [showNotif, setShowNotif]          = useState(false);
  const [showLogout, setShowLogout]        = useState(false);
  const [hoverSide, setHoverSide]          = useState<string | null>(null);

  function handleLogout() { setShowLogout(true); }

  const [novoNome,    setNovoNome]    = useState('');
  const [novoRodovia, setNovoRodovia] = useState('BR-116');
  const [novoKm,      setNovoKm]      = useState('');
  const [novoTrecho,  setNovoTrecho]  = useState('');
  const [novoResp,    setNovoResp]    = useState('');
  const [confirmarExcluir, setConfirmarExcluir] = useState<Equipe | null>(null);

  const filtradas = useMemo(() => {
    const t = busca.toLowerCase();
    return equipes.filter((e) =>
      (e.nome.toLowerCase().includes(t) || e.responsavel.toLowerCase().includes(t) || e.id.toLowerCase().includes(t)) &&
      (rodoviaFiltro === 'Todas' || e.rodovia === rodoviaFiltro) &&
      (statusFiltro  === 'todas' || e.status  === statusFiltro)
    );
  }, [equipes, busca, rodoviaFiltro, statusFiltro]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / ITENS_POR_PAGINA));
  const paginaAtual  = Math.min(pagina, totalPaginas);
  const paginadas    = filtradas.slice((paginaAtual - 1) * ITENS_POR_PAGINA, paginaAtual * ITENS_POR_PAGINA);

  function resetPagina() { setPagina(1); }

  function abrirModalCriar() {
    setEquipeEditando(null);
    setNovoNome(''); setNovoKm(''); setNovoTrecho(''); setNovoResp(''); setNovoRodovia('BR-116');
    setModalCriar(true);
  }

  function abrirModalEditar(eq: Equipe) {
    setEquipeEditando(eq);
    setNovoNome(eq.nome); setNovoRodovia(eq.rodovia);
    setNovoKm(eq.km.replace('Km ', '')); setNovoTrecho(eq.trechoRodovia); setNovoResp(eq.responsavel);
    setModalCriar(true);
  }

  function handleSalvar() {
    if (!novoNome.trim() || !novoKm.trim() || !novoTrecho.trim() || !novoResp.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios.');
      return;
    }
    setModalCriar(false);
    if (equipeEditando) {
      setEquipes((p) => p.map((e) => e.id === equipeEditando.id
        ? { ...e, nome: novoNome.trim(), rodovia: novoRodovia, km: `Km ${novoKm.trim()}`, trechoRodovia: novoTrecho.trim(), responsavel: novoResp.trim() }
        : e));
    } else {
      const id = `#${String(equipes.length + 1).padStart(2, '0')}`;
      const nova: Equipe = { id, nome: novoNome.trim(), status: 'ativo', rodovia: novoRodovia, km: `Km ${novoKm.trim()}`, trechoRodovia: novoTrecho.trim(), responsavel: novoResp.trim() };
      setEquipes((p) => [nova, ...p]);
      setPagina(1);
    }
  }

  function handleExcluir(eq: Equipe) {
    setConfirmarExcluir(eq);
  }

  function confirmarDelete() {
    if (confirmarExcluir) {
      setEquipes((p) => p.filter((e) => e.id !== confirmarExcluir.id));
      setConfirmarExcluir(null);
    }
  }

  function handleAlternarStatus(id: string) {
    const ciclo: StatusEquipe[] = ['ativo', 'em_campo', 'inativo'];
    setEquipes((p) => p.map((e) => e.id !== id ? e : { ...e, status: ciclo[(ciclo.indexOf(e.status) + 1) % 3] }));
  }

  function paginasBotoes() {
    const pages: (number | '...')[] = [];
    if (totalPaginas <= 5) {
      for (let i = 1; i <= totalPaginas; i++) pages.push(i);
    } else {
      pages.push(1);
      if (paginaAtual > 3) pages.push('...');
      for (let i = Math.max(2, paginaAtual - 1); i <= Math.min(totalPaginas - 1, paginaAtual + 1); i++) pages.push(i);
      if (paginaAtual < totalPaginas - 2) pages.push('...');
      pages.push(totalPaginas);
    }
    return pages;
  }

  return (
    <View style={s.root}>
      {/* ── BACKGROUND ROXO ──────────────────────────────────────────────── */}
      <ImageBackground source={bgRoxo} style={StyleSheet.absoluteFill} resizeMode="cover" imageStyle={s.bgFill} />

      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <View style={s.header}>
        {/* Logo + menu */}
        <View style={s.hLeft}>
          <Image source={logoNeg} style={s.hLogo} resizeMode="contain" />
          <TouchableOpacity onPress={() => setSidebarAberta((v) => !v)}>
            <Ionicons name="menu" size={22} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>
        </View>

        {/* Ícones agrupados em pill + avatar */}
        <View style={s.hRight}>
          <View style={s.hIconPill}>
            <TouchableOpacity style={s.hPillBtn}>
              <Ionicons name="sunny-outline" size={17} color="rgba(255,255,255,0.85)" />
            </TouchableOpacity>
            <View style={s.hPillDivider} />
            <TouchableOpacity style={s.hPillBtn} onPress={() => setShowNotif((v) => !v)}>
              <View>
                <Ionicons name="notifications-outline" size={17} color={showNotif ? '#fff' : 'rgba(255,255,255,0.85)'} />
                <View style={s.notifDot} />
              </View>
            </TouchableOpacity>
            <View style={s.hPillDivider} />
            <TouchableOpacity style={s.hPillBtn}>
              <Ionicons name="settings-outline" size={17} color="rgba(255,255,255,0.85)" />
            </TouchableOpacity>
            <View style={s.hPillDivider} />
            <TouchableOpacity style={s.hPillBtn} onPress={handleLogout}>
              <MaterialIcons name="logout" size={17} color="rgba(255,255,255,0.85)" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={s.hAvatar}>
            <Image source={perfilLogo} style={s.hAvatarImg} resizeMode="cover" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── BODY ─────────────────────────────────────────────────────────── */}
      <View style={s.body}>

        {/* Sidebar — toggle pelo botão menu */}
        {sidebarAberta && (
          <View style={s.sidebar}>
            {[
              { icon: 'grid-outline',      label: 'Dashboard',    onPress: undefined,                                  ativo: false },
              { icon: 'people-outline',    label: 'Equipes',      onPress: undefined,                                  ativo: true  },
              { icon: 'warning-outline',   label: 'Ocorrências',  onPress: () => navigation.navigate('Ocorrencias'),   ativo: false },
              { icon: 'map-outline',       label: 'Trechos',      onPress: undefined,                                  ativo: false },
              { icon: 'calendar-outline',  label: 'Planejamento', onPress: undefined,                                  ativo: false },
              { icon: 'bar-chart-outline', label: 'Relatórios',   onPress: undefined,                                  ativo: false },
              { icon: 'settings-outline',  label: 'Config.',      onPress: undefined,                                  ativo: false },
            ].map((item) => {
              const hovered = hoverSide === item.label && !item.ativo;
              return (
                <Pressable
                  key={item.label}
                  style={[s.sideItem, item.ativo && s.sideItemAtivo, hovered && s.sideItemHover]}
                  onPress={item.onPress}
                  onHoverIn={() => setHoverSide(item.label)}
                  onHoverOut={() => setHoverSide(null)}
                >
                  <View style={s.sideItemIcon}>
                    <Ionicons
                      name={item.icon as any}
                      size={18}
                      color={item.ativo ? '#fff' : hovered ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)'}
                    />
                  </View>
                  <Text style={[s.sideLabel, item.ativo && s.sideLabelAtivo, hovered && s.sideLabelHover]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Card branco principal */}
        <View style={s.contentCard}>
          {/* Background branco como imagem dentro do card */}
          <ImageBackground source={bgBranca} style={StyleSheet.absoluteFill} resizeMode="cover" imageStyle={{ borderRadius: 20, opacity: 0.4 }} />

          <ScrollView
            style={s.scroll}
            contentContainerStyle={s.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Título + botão */}
            <View style={s.titleRow}>
              <View style={s.titleBlock}>
                <Text style={s.titulo}>Gerenciamento de Equipes</Text>
                <Text style={s.subtitulo}>
                  Controle operacional da malha rodoviária federal e estadual sob concessão
                </Text>
              </View>
              <TouchableOpacity style={s.btnCriar} onPress={abrirModalCriar}>
                <Text style={s.btnCriarTxt}>+ Criar Novas Equipes</Text>
              </TouchableOpacity>
            </View>

            {/* Barra busca + filtros */}
            <View style={s.toolbarRow}>
              <View style={s.searchBox}>
                <Ionicons name="search-outline" size={15} color={colors.gray400} />
                <TextInput
                  style={s.searchInput}
                  placeholder="Buscar equipes..."
                  placeholderTextColor={colors.gray400}
                  value={busca}
                  onChangeText={(t) => { setBusca(t); resetPagina(); }}
                />
                {busca.length > 0 && (
                  <TouchableOpacity onPress={() => { setBusca(''); resetPagina(); }}>
                    <Ionicons name="close-circle" size={14} color={colors.gray400} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Dropdown Rodovias */}
              <View style={s.dropWrap}>
                <TouchableOpacity
                  style={[s.dropdown, dropRodovia && s.dropdownOpen]}
                  onPress={() => { setDropRodovia(!dropRodovia); setDropStatus(false); }}
                >
                  <View>
                    <Text style={s.dropLbl}>Rodovias</Text>
                    <Text style={s.dropVal}>{rodoviaFiltro}</Text>
                  </View>
                  <Ionicons name={dropRodovia ? 'chevron-up' : 'chevron-down'} size={12} color={colors.gray500} />
                </TouchableOpacity>
                {dropRodovia && (
                  <View style={s.dropMenu}>
                    {RODOVIAS.map((r) => (
                      <TouchableOpacity key={r} style={[s.dropItem, rodoviaFiltro === r && s.dropItemOn]}
                        onPress={() => { setRodoviaFiltro(r); setDropRodovia(false); resetPagina(); }}>
                        <Text style={[s.dropItemTxt, rodoviaFiltro === r && s.dropItemTxtOn]}>{r}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Dropdown Status */}
              <View style={s.dropWrap}>
                <TouchableOpacity
                  style={[s.dropdown, dropStatus && s.dropdownOpen]}
                  onPress={() => { setDropStatus(!dropStatus); setDropRodovia(false); }}
                >
                  <View>
                    <Text style={s.dropLbl}>Status</Text>
                    <Text style={s.dropVal}>{STATUS_OPTS.find((x) => x.value === statusFiltro)?.label}</Text>
                  </View>
                  <Ionicons name={dropStatus ? 'chevron-up' : 'chevron-down'} size={12} color={colors.gray500} />
                </TouchableOpacity>
                {dropStatus && (
                  <View style={s.dropMenu}>
                    {STATUS_OPTS.map((opt) => (
                      <TouchableOpacity key={opt.value} style={[s.dropItem, statusFiltro === opt.value && s.dropItemOn]}
                        onPress={() => { setStatusFiltro(opt.value); setDropStatus(false); resetPagina(); }}>
                        <Text style={[s.dropItemTxt, statusFiltro === opt.value && s.dropItemTxtOn]}>{opt.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* Cabeçalho da tabela */}
            <View style={s.thead}>
              <Text style={[s.th, s.cId]}>ID</Text>
              <Text style={[s.th, s.cEq]}>Equipe</Text>
              <Text style={[s.th, s.cSt]}>Status</Text>
              <Text style={[s.th, s.cRd]}>Rodovia</Text>
              <Text style={[s.th, s.cTr]}>Trecho da Rodovia</Text>
              <Text style={[s.th, s.cRs]}>Responsável</Text>
              <Text style={[s.th, s.cAc]}>Ações</Text>
            </View>

            {/* Linhas */}
            {paginadas.length === 0 ? (
              <View style={s.emptyBox}>
                <Ionicons name="search-outline" size={36} color={colors.gray300} />
                <Text style={s.emptyTxt}>Nenhuma equipe encontrada</Text>
              </View>
            ) : (
              paginadas.map((eq) => (
                <View key={eq.id} style={s.trow}>
                  <Text style={[s.tdId, s.cId]}>{eq.id}</Text>

                  <View style={[s.cEq, s.cellRow]}>
                    <Image source={perfilEq} style={s.avatarRow} />
                    <Text style={s.tdTxt}>{eq.nome}</Text>
                  </View>

                  <View style={s.cSt}>
                    <StatusBadge status={eq.status} />
                  </View>

                  <View style={s.cRd}>
                    <Text style={s.tdTxt}>{eq.rodovia}</Text>
                    <Text style={s.tdSub}>{eq.km}</Text>
                  </View>

                  <Text style={[s.tdTxt, s.cTr]}>{eq.trechoRodovia}</Text>

                  <View style={[s.cRs, s.cellRow]}>
                    <Image source={perfilEq} style={s.avatarRow} />
                    <Text style={s.tdTxt}>{eq.responsavel}</Text>
                  </View>

                  <View style={[s.cAc, s.cellRow]}>
                    <TouchableOpacity style={[s.acBtn, { backgroundColor: '#EDE9FE' }]} onPress={() => abrirModalEditar(eq)}>
                      <MaterialIcons name="edit" size={13} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.acBtn, { backgroundColor: '#E0F2FE' }]} onPress={() => handleAlternarStatus(eq.id)}>
                      <FontAwesome5 name="sitemap" size={11} color="#0EA5E9" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.acBtn, { backgroundColor: '#F3F0FF' }]}>
                      <Ionicons name="pricetag-outline" size={12} color="#8B5CF6" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.acBtn, { backgroundColor: '#FEE2E2' }]} onPress={() => handleExcluir(eq)}>
                      <Ionicons name="trash-outline" size={12} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}

            {/* Paginação */}
            <View style={s.pagination}>
              <TouchableOpacity
                style={[s.pgBtn, paginaAtual === 1 && s.pgBtnOff]}
                onPress={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={paginaAtual === 1}
              >
                <Ionicons name="chevron-back" size={14} color={paginaAtual === 1 ? colors.gray300 : colors.secondary} />
              </TouchableOpacity>

              {paginasBotoes().map((p, i) =>
                p === '...' ? (
                  <Text key={`d${i}`} style={s.pgDots}>...</Text>
                ) : (
                  <TouchableOpacity
                    key={p}
                    style={[s.pgBtn, paginaAtual === p && s.pgBtnOn]}
                    onPress={() => setPagina(p as number)}
                  >
                    <Text style={[s.pgTxt, paginaAtual === p && s.pgTxtOn]}>{p}</Text>
                  </TouchableOpacity>
                )
              )}

              <TouchableOpacity
                style={[s.pgBtn, paginaAtual === totalPaginas && s.pgBtnOff]}
                onPress={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                disabled={paginaAtual === totalPaginas}
              >
                <Ionicons name="chevron-forward" size={14} color={paginaAtual === totalPaginas ? colors.gray300 : colors.secondary} />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>

      {/* ── MODAL ────────────────────────────────────────────────────────── */}
      <Modal visible={modalCriar} transparent animationType="fade">
        <View style={s.overlay}>
          <View style={s.modalCard}>
            <View style={s.modalHead}>
              <Text style={s.modalTitulo}>{equipeEditando ? `Editar ${equipeEditando.id}` : 'Nova Equipe'}</Text>
              <TouchableOpacity onPress={() => setModalCriar(false)}>
                <Ionicons name="close" size={22} color={colors.secondary} />
              </TouchableOpacity>
            </View>

            {[
              { label: 'Nome da equipe', val: novoNome,   set: setNovoNome,   ph: 'Ex: Equipe Alfa'       },
              { label: 'Km',            val: novoKm,     set: setNovoKm,     ph: 'Ex: 50'                },
              { label: 'Trecho',        val: novoTrecho, set: setNovoTrecho, ph: 'Ex: Rodoanel Oeste'    },
              { label: 'Responsável',   val: novoResp,   set: setNovoResp,   ph: 'Ex: Eng. Silva'        },
            ].map((f) => (
              <View key={f.label} style={s.mField}>
                <Text style={s.mLabel}>{f.label}</Text>
                <TextInput style={s.mInput} placeholder={f.ph} placeholderTextColor={colors.gray400} value={f.val} onChangeText={f.set} />
              </View>
            ))}

            <View style={s.mField}>
              <Text style={s.mLabel}>Rodovia</Text>
              <View style={s.chipRow}>
                {['BR-116', 'BR-381', 'SP-280'].map((r) => (
                  <TouchableOpacity key={r} style={[s.chip, novoRodovia === r && s.chipOn]} onPress={() => setNovoRodovia(r)}>
                    <Text style={[s.chipTxt, novoRodovia === r && s.chipTxtOn]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={s.mFooter}>
              <TouchableOpacity style={s.mBtnCancel} onPress={() => setModalCriar(false)}>
                <Text style={s.mBtnCancelTxt}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.mBtnSave} onPress={handleSalvar}>
                <Text style={s.mBtnSaveTxt}>{equipeEditando ? 'Salvar' : 'Criar Equipe'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── POPUP NOTIFICAÇÕES ───────────────────────────────────────────── */}
      {showNotif && (
        <View style={s.notifPanel}>
          <View style={s.notifHeader}>
            <Text style={s.notifTitulo}>Notificações</Text>
            <TouchableOpacity onPress={() => setShowNotif(false)}>
              <Ionicons name="close" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>
          {NOTIFICACOES.map((n) => (
            <View key={n.id} style={s.notifItem}>
              <View style={[s.notifCircle, { backgroundColor: n.cor }]} />
              <View style={s.notifTextoBox}>
                <View style={s.notifTitleRow}>
                  <Text style={s.notifTituloPill}>{n.titulo}</Text>
                  <Text style={s.notifTempo}>{n.tempo}</Text>
                </View>
                <Text style={s.notifDesc} numberOfLines={2}>{n.desc}</Text>
              </View>
            </View>
          ))}
          <TouchableOpacity style={s.notifVerTodos}>
            <Text style={s.notifVerTodosTxt}>Ver todas as notificações</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── MODAL LOGOUT ─────────────────────────────────────────────────── */}
      <Modal visible={showLogout} transparent animationType="fade">
        <View style={s.overlay}>
          <View style={s.delCard}>
            <View style={[s.delIconBox, { backgroundColor: '#EDE9FE' }]}>
              <MaterialIcons name="logout" size={26} color={colors.primary} />
            </View>
            <Text style={s.delTitulo}>Encerrar sessão</Text>
            <Text style={s.delDesc}>Tem certeza que deseja sair?{'\n'}Você será redirecionado para o login.</Text>
            <View style={s.delBtns}>
              <TouchableOpacity style={s.delBtnCancel} onPress={() => setShowLogout(false)}>
                <Text style={s.delBtnCancelTxt}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.delBtnConfirm, { backgroundColor: colors.primary }]} onPress={() => navigation.replace('Login')}>
                <MaterialIcons name="logout" size={14} color="#fff" />
                <Text style={s.delBtnConfirmTxt}>Sair</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── MODAL EXCLUIR ────────────────────────────────────────────────── */}
      <Modal visible={confirmarExcluir !== null} transparent animationType="fade">
        <View style={s.overlay}>
          <View style={s.delCard}>
            <View style={s.delIconBox}>
              <Ionicons name="trash" size={28} color={colors.error} />
            </View>
            <Text style={s.delTitulo}>Excluir equipe</Text>
            <Text style={s.delDesc}>
              Tem certeza que deseja excluir a{' '}
              <Text style={{ fontWeight: '700' }}>{confirmarExcluir?.nome}</Text>?
              {'\n'}Esta ação não pode ser desfeita.
            </Text>
            <View style={s.delBtns}>
              <TouchableOpacity style={s.delBtnCancel} onPress={() => setConfirmarExcluir(null)}>
                <Text style={s.delBtnCancelTxt}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.delBtnConfirm} onPress={confirmarDelete}>
                <Ionicons name="trash-outline" size={14} color="#fff" />
                <Text style={s.delBtnConfirmTxt}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: '#3B0FA6' },
  bgFill:  { width: '100%', height: '100%' },

  // Header — fundo transparente para mostrar o backgroundroxo
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'transparent', paddingHorizontal: 22, paddingVertical: 10, zIndex: 10 },
  hLeft:       { flexDirection: 'row', alignItems: 'center', gap: 18 },
  hLogo:       { width: 130, height: 36 },
  hRight:      { flexDirection: 'row', alignItems: 'center', gap: 10 },

  hIconPill:    { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  hPillBtn:     { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  hPillDivider: { width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.15)' },

  hAvatar:     { width: 36, height: 36, borderRadius: 18, overflow: 'hidden', borderWidth: 2, borderColor: colors.primary },
  hAvatarImg:  { width: '100%', height: '100%' },

  // Body layout
  body:    { flex: 1, flexDirection: 'row', paddingHorizontal: 48, paddingVertical: 16 },
  sidebar:       { width: 160, marginRight: 14, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', paddingHorizontal: 10, paddingVertical: 12 },
  sideItem:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, marginVertical: 2 },
  sideItemIcon:  { marginRight: 10 },
  sideItemAtivo: { backgroundColor: colors.primary },
  sideItemHover: { backgroundColor: 'rgba(255,255,255,0.1)' },
  sideLabel:     { fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: '500' },
  sideLabelAtivo:{ color: '#fff', fontWeight: '700' },
  sideLabelHover:{ color: 'rgba(255,255,255,0.9)' },

  // Notificações popup (Motiva white theme)
  notifDot:       { position: 'absolute', top: -2, right: -2, width: 7, height: 7, borderRadius: 4, backgroundColor: '#EF4444', borderWidth: 1, borderColor: '#fff' },
  notifPanel:     { position: 'absolute', top: 58, right: 80, width: 340, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#EDE9FE', shadowColor: '#5E22F3', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 24, elevation: 20, zIndex: 200 },
  notifHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', backgroundColor: '#FAF8FF', borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  notifTitulo:    { fontSize: 15, fontWeight: '700', color: colors.secondary },
  notifItem:      { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 20, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  notifCircle:    { width: 42, height: 42, borderRadius: 21, marginRight: 14, marginTop: 2 },
  notifTextoBox:  { flex: 1 },
  notifTitleRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  notifTituloPill:{ fontSize: 13, fontWeight: '700', color: colors.secondary },
  notifTempo:     { fontSize: 11, color: '#94A3B8' },
  notifDesc:      { fontSize: 12, color: '#64748B', lineHeight: 17 },
  notifVerTodos:  { paddingVertical: 13, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  notifVerTodosTxt:{ fontSize: 12, color: colors.primary, fontWeight: '700' },

  // Card branco
  contentCard: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.97)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  scroll:        { flex: 1 },
  scrollContent: { padding: 16, gap: 8, paddingBottom: 16 },

  // Título
  titleRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 },
  titleBlock: { flex: 1 },
  titulo:     { fontSize: 18, fontWeight: '700', color: colors.secondary },
  subtitulo:  { fontSize: 11, color: colors.gray400, marginTop: 2 },
  btnCriar:   { backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 5 },
  btnCriarTxt:{ color: colors.white, fontWeight: '700', fontSize: 12 },

  // Toolbar
  toolbarRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', alignItems: 'flex-start', zIndex: 30 },
  searchBox:  { flex: 1, minWidth: 180, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 8, paddingHorizontal: 12, gap: 8, borderWidth: 1, borderColor: '#E2E8F0', height: 36 },
  searchInput:{ flex: 1, fontSize: 12, color: colors.secondary, outlineStyle: 'none' } as any,

  dropWrap:    { position: 'relative', zIndex: 40 },
  dropdown:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4, gap: 10, minWidth: 120, height: 36 },
  dropdownOpen:{ borderColor: colors.primary, backgroundColor: '#FAF5FF' },
  dropLbl:     { fontSize: 9, color: colors.gray400, textTransform: 'uppercase', letterSpacing: 0.4 },
  dropVal:     { fontSize: 13, color: colors.secondary, fontWeight: '600', marginTop: 1 },
  dropMenu:    { position: 'absolute', top: 46, left: 0, right: 0, backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', zIndex: 100, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 12 },
  dropItem:    { paddingHorizontal: 14, paddingVertical: 10 },
  dropItemOn:  { backgroundColor: '#EDE9FE' },
  dropItemTxt: { fontSize: 13, color: colors.secondary },
  dropItemTxtOn:{ color: colors.primary, fontWeight: '600' },

  // Cabeçalho tabela
  thead:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  th:      { fontSize: 9, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 },

  // Linhas como cards
  trow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 5,
    marginVertical: 1,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EAEFF6',
  },

  emptyBox: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyTxt: { color: colors.gray400, fontSize: 14 },

  // Colunas
  cId: { width: 52 },
  cEq: { flex: 1.5 },
  cSt: { flex: 1 },
  cRd: { flex: 0.9 },
  cTr: { flex: 1.6 },
  cRs: { flex: 1.5 },
  cAc: { width: 120 },

  tdId:    { fontSize: 11, fontWeight: '700', color: colors.primary },
  tdTxt:   { fontSize: 11, color: '#334155', fontWeight: '500' },
  tdSub:   { fontSize: 10, color: '#94A3B8' },
  cellRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  avatarRow:{ width: 22, height: 22, borderRadius: 11 },
  acBtn:   { width: 24, height: 24, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },

  // Paginação
  pagination:{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 4, marginTop: 8 },
  pgBtn:  { width: 30, height: 30, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  pgBtnOn:{ backgroundColor: colors.primary, borderColor: colors.primary },
  pgBtnOff:{ opacity: 0.35 },
  pgTxt:  { fontSize: 12, color: colors.secondary, fontWeight: '500' },
  pgTxtOn:{ color: '#fff', fontWeight: '700' },
  pgDots: { fontSize: 13, color: '#94A3B8', paddingHorizontal: 2 },

  // Modal
  overlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard: { backgroundColor: '#fff', borderRadius: 20, padding: 24, width: '100%', maxWidth: 420, gap: 14 },
  modalHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitulo:{ fontSize: 17, fontWeight: '700', color: colors.secondary },
  mField:    { gap: 5 },
  mLabel:    { fontSize: 11, fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.3 },
  mInput:    { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: colors.secondary, outlineStyle: 'none' } as any,
  chipRow:   { flexDirection: 'row', gap: 8 },
  chip:      { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  chipOn:    { backgroundColor: colors.primary, borderColor: colors.primary },
  chipTxt:   { fontSize: 12, color: '#64748B' },
  chipTxtOn: { color: '#fff', fontWeight: '600' },
  mFooter:   { flexDirection: 'row', gap: 10, marginTop: 4 },
  mBtnCancel:{ flex: 1, paddingVertical: 11, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  mBtnCancelTxt:{ color: '#64748B', fontWeight: '500', fontSize: 13 },
  mBtnSave:  { flex: 1, paddingVertical: 11, borderRadius: 8, backgroundColor: colors.primary, alignItems: 'center' },
  mBtnSaveTxt:{ color: '#fff', fontWeight: '700', fontSize: 13 },

  // Modal excluir
  delCard:        { backgroundColor: '#fff', borderRadius: 20, padding: 28, width: '100%', maxWidth: 360, alignItems: 'center', gap: 12 },
  delIconBox:     { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  delTitulo:      { fontSize: 18, fontWeight: '700', color: colors.secondary },
  delDesc:        { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 20 },
  delBtns:        { flexDirection: 'row', gap: 10, width: '100%', marginTop: 4 },
  delBtnCancel:   { flex: 1, paddingVertical: 11, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  delBtnCancelTxt:{ color: '#64748B', fontWeight: '500', fontSize: 13 },
  delBtnConfirm:  { flex: 1, paddingVertical: 11, borderRadius: 8, backgroundColor: colors.error, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  delBtnConfirmTxt:{ color: '#fff', fontWeight: '700', fontSize: 13 },
});
