import { SeveridadeVegetacao } from '../types';

// Faixas alinhadas ao Anexo 06/ARTESP: poda obrigatória a partir de 30cm (regra geral).
// 0–29cm dividido em 3 faixas iguais (10cm cada) para dar visibilidade de progressão.
// Extraído de KanbanScreen.tsx pra ser compartilhado com KanbanContext (fluxo de
// sensores) sem duplicar a regra nem importar de dentro de uma tela.
export function calcSeveridade(cm: number): SeveridadeVegetacao {
  if (cm >= 30) return 'critico';
  if (cm >= 20) return 'grave';
  if (cm >= 10) return 'leve';
  return 'sem_ocorrencia';
}
