import { useEffect } from 'react';
import { useEquipes } from './EquipesContext';
import { useKanban } from './KanbanContext';
import { coordenadasAproximadas, corrigirComGeocodingSeNecessario } from '../utils/geo';
import { cardsOrfaos, equipesSemCardNoKanban } from '../utils/equipeKanbanSync';

/**
 * Garante o mesmo invariante nos dois sentidos entre Equipes e Kanban:
 * - Toda equipe com status diferente de 'inativo' tem pelo menos um card no
 *   Kanban (mesmo invariante que já vale ao criar uma equipe pela tela).
 * - Todo card do Kanban com `equipeId` aponta pra uma equipe que realmente
 *   existe — um card "fantasma" apontando pra uma equipe já excluída fica
 *   visível no Kanban mas invisível em Equipes, o que é inconsistente e
 *   confunde quem está usando o app.
 * Sem isso, qualquer forma histórica de os dois ficarem fora de sincronia
 * (dado criado antes desses fluxos existirem, uma falha no meio de uma
 * operação, edição direta do armazenamento etc.) nunca se auto-corrige. Roda
 * uma vez, só depois que as duas fontes (Equipes e Kanban) já hidrataram —
 * sem essa espera, o efeito veria o Kanban ainda vazio (`itens: []`) durante
 * o carregamento inicial e criaria/removeria cards errado pra todo mundo.
 */
export function SincronizarEquipesKanban() {
  const { equipes, isHydrated: equipesHidratado } = useEquipes();
  const { itens, adicionarItem, atualizarItem, removerItem, isHydrated: kanbanHidratado } = useKanban();

  useEffect(() => {
    if (!equipesHidratado || !kanbanHidratado) return;

    const orfas = equipesSemCardNoKanban(equipes, itens);
    orfas.forEach((equipe) => {
      const kmNum = parseFloat(equipe.km.replace('Km ', '')) || 0;
      const novoId = adicionarItem({
        equipeId: equipe.id, nomeEquipe: equipe.nome, rodovia: equipe.rodovia,
        kmInicio: kmNum, kmFim: kmNum + 5,
        tipoVegetacao: 'Grama Bermuda (Rasteira)', alturaAtual: 2,
        severidade: 'sem_ocorrencia', responsavel: equipe.responsavel,
        observacao: '', ultimoServico: null,
        ...coordenadasAproximadas(equipe.rodovia, kmNum),
      });
      corrigirComGeocodingSeNecessario(equipe.rodovia, kmNum).then((corrigida) => {
        if (corrigida) atualizarItem(novoId, corrigida);
      });
    });

    cardsOrfaos(equipes, itens).forEach((card) => removerItem(card.id));
  }, [equipes, itens, equipesHidratado, kanbanHidratado, adicionarItem, atualizarItem, removerItem]);

  return null;
}
