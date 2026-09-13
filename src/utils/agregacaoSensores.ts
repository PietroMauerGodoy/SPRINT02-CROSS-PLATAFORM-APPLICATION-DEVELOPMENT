import { KanbanItem, LeituraSensorRaw } from '../types';

/**
 * Agrupa leituras cruas por `id` (km do ponto de medição) e mantém só a de
 * MENOR `altura` de cada grupo — nunca a mais recente, nunca uma média.
 *
 * Por quê o menor valor: o sensor ultrassônico (HC-SR04) mede a distância até
 * o topo da vegetação, e reflexões/ângulo de leitura tendem a fazer o sensor
 * "enxergar" uma altura maior do que a real (ruído que superestima). Entre
 * várias leituras do mesmo ponto no mesmo lote, a menor altura é o valor mais
 * confiável — é comparação só dentro do lote recebido num único GET, não com
 * o histórico já salvo no card.
 *
 * Exemplo:
 *   entrada:  [{id:"5.0",altura:12.3}, {id:"5.0",altura:15.1}, {id:"12.5",altura:8.0}]
 *   saida:    [{id:"5.0",altura:12.3}, {id:"12.5",altura:8.0}]
 */
export function agregarLeiturasPorMenorValor(leituras: LeituraSensorRaw[]): LeituraSensorRaw[] {
  const menorPorId = new Map<string, LeituraSensorRaw>();

  for (const leitura of leituras) {
    const atual = menorPorId.get(leitura.id);
    if (!atual || leitura.altura < atual.altura) {
      menorPorId.set(leitura.id, leitura);
    }
  }

  return Array.from(menorPorId.values());
}

/**
 * Encontra o card do Kanban cujo range `kmInicio`–`kmFim` contém o km
 * informado. Uma leitura pontual (ex: km 12.5) pode cair dentro do trecho de
 * um card só (ex: kmInicio 10, kmFim 15) — não é comparação de igualdade.
 */
export function encontrarCardPorKm(km: number, itens: KanbanItem[]): KanbanItem | undefined {
  return itens.find((item) => km >= item.kmInicio && km <= item.kmFim);
}
