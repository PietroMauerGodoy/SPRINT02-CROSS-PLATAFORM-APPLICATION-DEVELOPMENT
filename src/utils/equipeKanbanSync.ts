import { Equipe, KanbanItem } from '../types';

/**
 * Equipes que deveriam ter um card no Kanban (status diferente de 'inativo')
 * mas não têm nenhum — ex: uma equipe criada antes de o fluxo de criação
 * sincronizar com o Kanban existir, ou qualquer outra forma de os dois
 * ficarem fora de sincronia. Usado por `SincronizarEquipesKanban` pra
 * auto-curar essa inconsistência sem exigir ação manual do usuário.
 */
export function equipesSemCardNoKanban(equipes: Equipe[], itens: KanbanItem[]): Equipe[] {
  const idsComCard = new Set(itens.filter((i) => i.equipeId).map((i) => i.equipeId));
  return equipes.filter((e) => e.status !== 'inativo' && !idsComCard.has(e.id));
}

/**
 * Espelho do caso acima: cards do Kanban com `equipeId` preenchido apontando
 * pra uma equipe que não existe mais (ex: equipe excluída antes de o próprio
 * fluxo de exclusão limpar o Kanban direito, ou qualquer outra forma de os
 * dois ficarem fora de sincronia). Cards sem `equipeId` (criados via "+
 * adicionar cartão" avulso, sem vínculo com nenhuma equipe) NÃO entram aqui —
 * só cards que apontam pra um id de equipe inexistente.
 */
export function cardsOrfaos(equipes: Equipe[], itens: KanbanItem[]): KanbanItem[] {
  const idsDeEquipes = new Set(equipes.map((e) => e.id));
  return itens.filter((i) => i.equipeId && !idsDeEquipes.has(i.equipeId));
}
