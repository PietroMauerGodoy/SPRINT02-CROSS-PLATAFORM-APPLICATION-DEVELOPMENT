import { createContext, useContext, useState, ReactNode } from 'react';
import { KanbanItem, SeveridadeVegetacao } from '../types';
import { mockKanban } from '../data/mockData';

type KanbanContextType = {
  itens:              KanbanItem[];
  adicionarItem:      (item: Omit<KanbanItem, 'id'>) => string;
  atualizarItem:      (id: string, updates: Partial<KanbanItem>) => void;
  removerItem:        (id: string) => void;
  removerPorEquipeId: (equipeId: string) => void;
  limparColuna:       (sev: SeveridadeVegetacao) => void;
  temEquipeNoKanban:  (equipeId: string) => boolean;
};

const KanbanContext = createContext<KanbanContextType | null>(null);

export function KanbanProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<KanbanItem[]>(mockKanban);
  let nextNum = itens.length + 1;

  function adicionarItem(item: Omit<KanbanItem, 'id'>): string {
    const id = `K${String(nextNum++).padStart(2, '0')}`;
    setItens((prev) => [{ id, ...item }, ...prev]);
    return id;
  }

  function atualizarItem(id: string, updates: Partial<KanbanItem>) {
    setItens((prev) => prev.map((i) => i.id === id ? { ...i, ...updates } : i));
  }

  function removerItem(id: string) {
    setItens((prev) => prev.filter((i) => i.id !== id));
  }

  function removerPorEquipeId(equipeId: string) {
    setItens((prev) => prev.filter((i) => i.equipeId !== equipeId));
  }

  function limparColuna(sev: SeveridadeVegetacao) {
    setItens((prev) => prev.filter((i) => i.severidade !== sev));
  }

  function temEquipeNoKanban(equipeId: string): boolean {
    return itens.some((i) => i.equipeId === equipeId);
  }

  return (
    <KanbanContext.Provider value={{ itens, adicionarItem, atualizarItem, removerItem, removerPorEquipeId, limparColuna, temEquipeNoKanban }}>
      {children}
    </KanbanContext.Provider>
  );
}

export function useKanban() {
  const ctx = useContext(KanbanContext);
  if (!ctx) throw new Error('useKanban deve ser usado dentro de KanbanProvider');
  return ctx;
}
