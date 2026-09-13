import { LeituraSensorRaw } from './types';

// Array em memória — decisão de propósito pra essa etapa (demo/sprint): zero
// configuração, roda na hora. Os dados somem se o servidor reiniciar; se
// precisar persistir de verdade depois, trocar por SQLite (ex: better-sqlite3)
// só nesta função, sem mexer nas rotas em index.ts.
let leituras: LeituraSensorRaw[] = [];

/** Chamado pelo POST — cada ESP32 empurra uma leitura por vez pra cá. */
export function registrarLeitura(leitura: LeituraSensorRaw): void {
  leituras.push(leitura);
}

/**
 * Chamado pelo GET — devolve tudo que foi acumulado desde a última vez que
 * alguém buscou, e ESVAZIA o buffer em seguida. Isso imita o comportamento de
 * "lote disponível agora": o app Motiva consome o lote inteiro a cada clique
 * em "Atualizar", então não faz sentido devolver a mesma leitura de novo na
 * próxima sincronização.
 */
export function consumirLeiturasPendentes(): LeituraSensorRaw[] {
  const lote = leituras;
  leituras = [];
  return lote;
}

/** Só pra debug/health-check — não some com o buffer. */
export function contarLeiturasPendentes(): number {
  return leituras.length;
}
