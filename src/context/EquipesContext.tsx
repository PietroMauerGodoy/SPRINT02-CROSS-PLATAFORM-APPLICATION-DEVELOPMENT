import { createContext, useContext, useState, ReactNode } from 'react';
import { Equipe, StatusEquipe } from '../types';
import { mockEquipes } from '../data/mockData';

type EquipesContextType = {
  equipes:          Equipe[];
  adicionarEquipe:  (e: Omit<Equipe, 'id' | 'status'>) => string;
  editarEquipe:     (id: string, dados: Omit<Equipe, 'id' | 'status'>) => void;
  excluirEquipe:    (id: string) => void;
  alternarStatus:   (id: string) => StatusEquipe; // só ativo ↔ inativo
  setStatusEquipe:  (id: string, status: StatusEquipe) => void; // usado pelo Kanban
};

const EquipesContext = createContext<EquipesContextType | null>(null);

export function EquipesProvider({ children }: { children: ReactNode }) {
  const [equipes, setEquipes] = useState<Equipe[]>(mockEquipes);

  function adicionarEquipe(dados: Omit<Equipe, 'id' | 'status'>): string {
    const id = `#${String(equipes.length + 1).padStart(2, '0')}`;
    setEquipes((prev) => [{ id, status: 'ativo', ...dados }, ...prev]);
    return id;
  }

  function editarEquipe(id: string, dados: Omit<Equipe, 'id' | 'status'>) {
    setEquipes((prev) => prev.map((e) => e.id === id ? { ...e, ...dados } : e));
  }

  function excluirEquipe(id: string) {
    setEquipes((prev) => prev.filter((e) => e.id !== id));
  }

  // Toggle manual: só ativo ↔ inativo (em_campo é setado pelo Kanban)
  function alternarStatus(id: string): StatusEquipe {
    let novoStatus: StatusEquipe = 'ativo';
    setEquipes((prev) => prev.map((e) => {
      if (e.id !== id) return e;
      novoStatus = e.status === 'inativo' ? 'ativo' : 'inativo';
      return { ...e, status: novoStatus };
    }));
    return novoStatus;
  }

  // Usado pelo KanbanScreen ao mover cards
  function setStatusEquipe(id: string, status: StatusEquipe) {
    setEquipes((prev) => prev.map((e) => e.id === id ? { ...e, status } : e));
  }

  return (
    <EquipesContext.Provider value={{ equipes, adicionarEquipe, editarEquipe, excluirEquipe, alternarStatus, setStatusEquipe }}>
      {children}
    </EquipesContext.Provider>
  );
}

export function useEquipes() {
  const ctx = useContext(EquipesContext);
  if (!ctx) throw new Error('useEquipes deve ser usado dentro de EquipesProvider');
  return ctx;
}
