import { LeituraSensorRaw } from '../types';

// Sensores em campo (ESP32 + HC-SR04) fazem POST direto pra uma API própria —
// o app nunca recebe esse POST. O fluxo aqui é sempre pull: o usuário aperta
// "Atualizar" no Kanban e o app busca (GET) o lote de leituras disponível.
//
// ─── QUANDO A API REAL EXISTIR, É SÓ ISTO: ──────────────────────────────────
// 1. Preencher BASE_URL abaixo com o endpoint real (GET, sem parâmetros).
// 2. Trocar o corpo de `buscarLeiturasSensor()` pra chamar `buscarLeiturasApi()`
//    em vez de `buscarLeiturasMock()` (a função já está pronta, só comentada).
// 3. Apagar `buscarLeiturasMock()`.
// Nada em KanbanContext, no botão ou em qualquer outra tela muda — todo mundo
// só conhece a assinatura `buscarLeiturasSensor(): Promise<LeituraSensorRaw[]>`.
const BASE_URL = ''; // TODO: preencher com o endpoint real (ex: 'http://192.168.0.10:3000/sensores/leituras')

// Formato esperado do GET (a API deve devolver exatamente isto — um array,
// não um objeto envelopado tipo `{ data: [...] }`):
//   [{ "id": "5.0", "altura": 12.3 }, { "id": "5.0", "altura": 15.1 }, ...]
async function buscarLeiturasMock(): Promise<LeituraSensorRaw[]> {
  return [
    { id: '0.0',  altura: 9.4 },
    { id: '5.0',  altura: 12.3 },
    { id: '5.0',  altura: 15.1 },   // duplicata proposital: testa a regra do menor valor
    { id: '12.5', altura: 8.0 },
    { id: '27.0', altura: 31.2 },
    { id: '999.0', altura: 20.0 },  // km sem card correspondente: deve ser ignorada
  ];
}

// Pronta pra usar assim que BASE_URL for preenchida — só trocar a chamada em
// `buscarLeiturasSensor()` (ver instrução acima). Valida que a resposta é
// mesmo um array antes de devolver, pra um formato de API errado (ex: API
// devolveu `{ leituras: [...] }` por engano) falhar aqui com uma mensagem
// clara, em vez de quebrar silenciosamente lá na frente na agregação.
async function buscarLeiturasApi(): Promise<LeituraSensorRaw[]> {
  const resposta = await fetch(BASE_URL);
  if (!resposta.ok) {
    throw new Error(`API de sensores respondeu ${resposta.status}`);
  }

  const dados = await resposta.json();
  if (!Array.isArray(dados)) {
    throw new Error('API de sensores devolveu um formato inesperado (esperava um array)');
  }

  return dados as LeituraSensorRaw[];
}

/**
 * Busca o lote de leituras de sensores disponível no momento (pull, sob demanda).
 * Hoje é mock; quando a API real existir, só o corpo desta função muda — a
 * assinatura (`async () => Promise<LeituraSensorRaw[]>`) e o contrato de erro
 * continuam os mesmos, então quem consome (KanbanContext, botão) não precisa mudar.
 */
export async function buscarLeiturasSensor(): Promise<LeituraSensorRaw[]> {
  try {
    return await buscarLeiturasMock(); // TODO: trocar por buscarLeiturasApi() quando a API existir
  } catch {
    throw new Error('Falha ao buscar leituras dos sensores');
  }
}
