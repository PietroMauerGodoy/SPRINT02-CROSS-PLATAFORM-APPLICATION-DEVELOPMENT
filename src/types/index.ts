export type RiscoNivel = 'baixo' | 'medio' | 'alto';

export type Ocorrencia = {
  id: number;
  descricao: string;
  /** Vínculo com o trecho real do Kanban (KanbanItem.id) — rodovia/km/equipe são
   *  derivados dele, não duplicados aqui. */
  kanbanItemId: string;
  risco: RiscoNivel;
  data: string;
  titulo: string;
  categoria: string;
  status: 'aberta' | 'em_andamento' | 'resolvida';
  responsavel?: string;
};

export type PapelUsuario = 'admin' | 'gestor' | 'operador_campo';

export type Usuario = {
  id: number;
  nome: string;
  usuario: string;
  /** Só para exibição na tela de Gestão de Usuários — o login usa `usuario`, não isto. */
  email?: string;
  senha: string;
  cargo: string;
  papel: PapelUsuario;
  /** Equipes às quais o usuário pertence — usado para escopo de acesso do papel
   *  'operador_campo'. Um Operador de Campo pode estar em mais de uma equipe. */
  equipeIds?: string[];
  avatar?: string;
};

export type StatusEquipe = 'ativo' | 'inativo' | 'em_campo';

export type Equipe = {
  id: string;
  nome: string;
  status: StatusEquipe;
  rodovia: string;
  km: string;
  trechoRodovia: string;
  responsavel: string;
};

export type SeveridadeVegetacao = 'sem_ocorrencia' | 'leve' | 'grave' | 'critico';

export type KanbanItem = {
  id: string;
  equipeId: string;
  nomeEquipe: string;
  rodovia: string;
  kmInicio: number;
  kmFim: number;
  tipoVegetacao: string;
  alturaAtual: number;
  severidade: SeveridadeVegetacao;
  responsavel: string;
  observacao: string;
  ultimoServico: { data: string; responsavel: string } | null;
  /** Coordenadas do ponto médio do trecho — usadas no mapa e na consulta de clima (Open-Meteo). */
  lat: number;
  lon: number;
  /** Data ISO ('YYYY-MM-DD') em que o trecho entrou na severidade atual — atualizada
   *  automaticamente pelo KanbanContext sempre que `severidade` muda. Usada para calcular
   *  o "tempo médio de resposta" do Dashboard. */
  entrouNaSeveridadeEm: string;
};

/** Retorno resumido da consulta de clima atual (Open-Meteo) para um trecho. */
export type ClimaAtual = {
  temperaturaC: number;
  precipitacaoMm: number;
  ventoKmh: number;
  umidadePct: number;
  codigoTempo: number;
};

export type SeveridadeSnapshot = {
  data: string; // 'YYYY-MM-DD'
  contagens: Record<SeveridadeVegetacao, number>;
};

/** Leitura crua de um sensor de altura de vegetação (ESP32 + HC-SR04), como
 *  vem no payload da API de sensores. `id` é o km do ponto de medição (ex: "5.0"). */
export type LeituraSensorRaw = {
  id: string;
  altura: number;
};

/** Estado da máquina de estados do botão "Atualizar" (sincronização de sensores). */
export type EstadoSincronizacao = 'idle' | 'sincronizando' | 'sucesso' | 'erro';

export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  Ocorrencias: undefined;
  Equipes: undefined;
  Kanban: { abrirDetalheId?: string } | undefined;
  Configuracoes: undefined;
  Cadastro: undefined;
  Detalhe: { ocorrencia: Ocorrencia };
  Trechos: undefined;
};
