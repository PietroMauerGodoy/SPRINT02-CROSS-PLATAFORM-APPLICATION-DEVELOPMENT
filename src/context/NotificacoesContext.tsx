import { createContext, useContext, useState, ReactNode } from 'react';

export type Notificacao = {
  id:       number;
  cor:      string;
  icone:    string;
  titulo:   string;
  desc:     string;
  criadaEm: Date;
};

type NotificacoesContextType = {
  notificacoes: Notificacao[];
  adicionarNotificacao: (n: Omit<Notificacao, 'id' | 'criadaEm'>) => void;
  limparTodas: () => void;
};

const NotificacoesContext = createContext<NotificacoesContextType | null>(null);

const INICIAIS: Notificacao[] = [
  {
    id: 1, cor: '#F59E0B', icone: 'warning-outline',
    titulo: 'Equipe inativa',
    desc: 'Equipe #03 está inativa há mais de 3 dias sem justificativa.',
    criadaEm: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: 2, cor: '#3B82F6', icone: 'people-outline',
    titulo: 'Nova equipe criada',
    desc: 'Equipe #11 foi cadastrada e está pronta para receber atribuições.',
    criadaEm: new Date(Date.now() - 60 * 60 * 1000),
  },
  {
    id: 3, cor: '#F97316', icone: 'location-outline',
    titulo: 'Equipe em campo',
    desc: 'Equipe #06 registrou entrada no trecho BR-116 Km 55.',
    criadaEm: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: 4, cor: '#8B5CF6', icone: 'document-text-outline',
    titulo: 'Relatório disponível',
    desc: 'O relatório semanal de operações foi gerado e está disponível.',
    criadaEm: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
];

export function tempoRelativo(data: Date): string {
  const diff = Math.floor((Date.now() - data.getTime()) / 1000);
  if (diff < 60)               return 'agora mesmo';
  if (diff < 3600)             return `${Math.floor(diff / 60)} min atrás`;
  if (diff < 86400)            return `${Math.floor(diff / 3600)}h atrás`;
  return `${Math.floor(diff / 86400)} dia${Math.floor(diff / 86400) > 1 ? 's' : ''} atrás`;
}

export function NotificacoesProvider({ children }: { children: ReactNode }) {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>(INICIAIS);
  let nextId = notificacoes.length + 1;

  function adicionarNotificacao(n: Omit<Notificacao, 'id' | 'criadaEm'>) {
    const nova: Notificacao = { ...n, id: nextId++, criadaEm: new Date() };
    setNotificacoes((prev) => [nova, ...prev]);
  }

  function limparTodas() {
    setNotificacoes([]);
  }

  return (
    <NotificacoesContext.Provider value={{ notificacoes, adicionarNotificacao, limparTodas }}>
      {children}
    </NotificacoesContext.Provider>
  );
}

export function useNotificacoes() {
  const ctx = useContext(NotificacoesContext);
  if (!ctx) throw new Error('useNotificacoes deve ser usado dentro de NotificacoesProvider');
  return ctx;
}
