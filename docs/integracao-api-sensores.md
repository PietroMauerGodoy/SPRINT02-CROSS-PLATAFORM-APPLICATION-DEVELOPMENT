# Integração da API de Sensores IoT — guia pra quem for implementar

> **Atualização: a API já existe** — está em [`/api`](../api) neste mesmo
> repositório (Node + TypeScript + Express, dados em memória). Ver
> [`api/README.md`](../api/README.md) pra rodar e conectar na mesma rede WiFi
> do ESP32. Este documento continua valendo como referência do **contrato**
> (formato exato esperado) e de como o app consome isso — útil tanto pra quem
> for mexer na API existente quanto se um dia ela for reescrita do zero.

Este documento é pra quem vai clonar o projeto **Motiva** e conectar a API real que
alimenta o botão **"Atualizar"** da tela Kanban. O app já está 100% pronto do lado
front-end — falta só apontar pra API e trocar 3 linhas num arquivo.

---

## TL;DR — os 3 passos

Tudo fica isolado em **`src/services/sensoresService.ts`**. Nenhum outro arquivo do
projeto precisa ser tocado.

1. Preencha a constante `BASE_URL` no topo do arquivo com o endpoint real (`GET`, sem parâmetros) — ver [`api/README.md`](../api/README.md) pra achar o IP certo (mesma rede WiFi do ESP32).
2. Dentro de `buscarLeiturasSensor()`, troque a chamada de `buscarLeiturasMock()` para `buscarLeiturasApi()` (essa função já existe no arquivo, pronta e funcional, só não está em uso ainda).
3. Apague `buscarLeiturasMock()` — não é mais usada.

```ts
// src/services/sensoresService.ts

const BASE_URL = 'http://192.168.0.10:3000/sensores/leituras'; // passo 1 — IP do notebook na rede WiFi

export async function buscarLeiturasSensor(): Promise<LeituraSensorRaw[]> {
  try {
    return await buscarLeiturasApi(); // passo 2 — era buscarLeiturasMock()
  } catch {
    throw new Error('Falha ao buscar leituras dos sensores');
  }
}
```

Depois disso, abra o app, logue como `admin` ou `joao` (Gestor), vá em **Kanban** e
aperte **"Atualizar"** — se a API estiver no ar e respondendo no formato certo (ver
abaixo), os cards já devem atualizar altura/severidade na hora.

---

## Contexto: de onde vêm os dados

Cada sensor em campo é um **ESP32 + sensor ultrassônico HC-SR04**, que mede a
distância até o topo da vegetação e converte isso em altura (cm). O ESP32 faz
`POST` **direto pra sua API** — o app **nunca** recebe esse POST.

O app funciona em modo **pull**: alguém aperta "Atualizar" no Kanban, e o app faz
um único `GET` pra buscar o lote de leituras disponível naquele momento. Não há
WebSocket, não há polling automático, não há push — é síncrono e sob demanda.

```
ESP32 (sensor) --POST--> [SUA API] <--GET-- App Motiva (botão "Atualizar")
```

---

## Contrato da API — o que você precisa implementar

### Endpoint

- **Método:** `GET`
- **Parâmetros:** nenhum (a API decide sozinha qual é "o lote disponível agora" —
  ex: todas as leituras da última hora, ou desde a última vez que alguém buscou;
  isso é decisão sua, o app não manda filtro nenhum)
- **Autenticação:** o app hoje não manda nenhum header de auth. Se a API exigir
  token/chave, você vai precisar adicionar isso dentro de `buscarLeiturasApi()`
  (é só um `fetch`, dá pra colocar headers nele sem problema).

### Resposta esperada (sucesso)

- **Status:** `200`
- **Corpo:** um **array JSON puro** — não um objeto envelopado como `{ "data": [...] }` ou `{ "leituras": [...] }`. O app espera literalmente isto:

```json
[
  { "id": "5.0", "altura": 12.3 },
  { "id": "5.0", "altura": 15.1 },
  { "id": "12.5", "altura": 8.0 }
]
```

| Campo | Tipo | Significado |
|---|---|---|
| `id` | `string` | O **km do ponto de medição**, como texto (ex: `"5.0"`, `"12.5"`). Não é um ID de sensor nem de trecho — é a posição na rodovia onde aquele sensor está instalado. |
| `altura` | `number` | Altura medida da vegetação, **em centímetros**. |

> Se a API devolver num formato diferente (ex: objeto envelopado, `altura` como
> string, etc.), o app **detecta e falha com uma mensagem clara** (`buscarLeiturasApi()`
> já valida que a resposta é um array antes de aceitar) — o botão "Atualizar" vai
> pro estado de erro (ícone vermelho) em vez de quebrar silenciosamente.

### O que pode vir no array

- **Pode ter várias leituras pro mesmo `id`** (mesmo km medido mais de uma vez) — o
  app decide sozinho qual usar (ver regra do menor valor abaixo). Não precisa
  deduplicar do seu lado.
- **Pode incluir km's que não correspondem a nenhum trecho cadastrado no app** —
  o app ignora essas silenciosamente (só loga um aviso no console pra debug). Você
  não precisa saber quais km's o app já tem cadastrado — devolva tudo que tiver.
- **Não precisa vir ordenado** de nenhum jeito específico.

### Erros

Qualquer coisa diferente de `200` com esse formato de array faz o app tratar como
falha (botão fica vermelho por 1.2s e volta ao normal, sem popup bloqueante). Não
há um formato de erro específico esperado no corpo — só o status HTTP já importa.

---

## O que o app já resolve sozinho (você não precisa replicar isso na API)

Essa parte já está implementada e testada no front-end — é só contexto pra você
entender por que a API pode ser "burra" (devolver os dados crus, sem agregação):

- **Regra do menor valor:** se várias leituras chegarem pro mesmo km, ou pra km's
  diferentes que caem no range de um mesmo trecho, o app sempre usa a **menor
  altura** entre elas (nunca a mais recente, nunca uma média) — porque o sensor
  ultrassônico tende a superestimar a altura por reflexão/ângulo, então o menor
  valor é o mais confiável. Ver `src/utils/agregacaoSensores.ts`.
- **Mapeamento km → trecho:** cada trecho no Kanban tem um `kmInicio`/`kmFim`. O
  app acha automaticamente qual trecho contém o km de cada leitura
  (`encontrarCardPorKm()`, mesmo arquivo acima).
- **Recalcular severidade:** depois de aplicar a nova altura, o app recalcula a
  severidade do trecho (Sem Ocorrência / Leve / Grave / Crítico) sozinho.
- **Notificação:** ao final de uma sincronização bem-sucedida, o app avisa o
  usuário quantos trechos foram atualizados.

Ou seja: **a API só precisa devolver leituras cruas**. Toda a lógica de negócio
já existe no client.

---

## Onde cada peça vive no código (se precisar debugar)

| Arquivo | O que tem |
|---|---|
| `src/services/sensoresService.ts` | **Único arquivo do app que você precisa editar** pra apontar pra API (mock hoje, `BASE_URL` real depois). |
| `src/types/index.ts` | Tipo `LeituraSensorRaw = { id: string; altura: number }` — o contrato. |
| `src/utils/agregacaoSensores.ts` | Regra do menor valor + mapeamento km→trecho (lógica pura, não precisa mexer). |
| `src/context/KanbanContext.tsx` | Função `aplicarLeiturasSensor()` — aplica as leituras já agregadas nos cards do Kanban. |
| `src/components/kanban/BotaoAtualizarSincronizacao.tsx` | O botão "Atualizar" em si (estados idle/sincronizando/sucesso/erro). |
| `api/` | **A API em si** (Node + Express + TypeScript). Ver [`api/README.md`](../api/README.md). |

---

## Como rodar tudo localmente pra testar

Terminal 1 — a API:
```bash
cd api
npm install
npm run dev
```

Terminal 2 — o app:
```bash
npm install
npx expo start --web
```

Login de teste (Admin ou Gestor — só esses papéis veem o botão "Atualizar"):

| Login | Senha |
|---|---|
| `admin` | `123456` |
| `joao` | `123456` |

Manda uma leitura de teste pra API (simulando o ESP32):
```bash
curl -X POST http://localhost:3000/sensores/leituras \
  -H "Content-Type: application/json" \
  -d '{"id":"5.0","altura":12.3}'
```

Vá em **Kanban**, confira os `kmInicio`/`kmFim` dos trechos que já existem lá (ou
crie um novo trecho com o km que você quer testar), aperte **"Atualizar"**, e veja
se o card correspondente atualiza altura/severidade.

Pra debugar sem depender da API estar no ar ainda, dá pra abrir o DevTools do
navegador e ver os `console.warn` de leituras sem trecho correspondente, ou
inspecionar a aba Network pra conferir a requisição/resposta real do seu `GET`.

---

## Checklist antes de considerar a integração pronta

- [ ] `GET` no endpoint devolve `200` com um array JSON (não envelopado).
- [ ] Cada item tem `id` (string, km) e `altura` (number, cm).
- [ ] Testado com múltiplas leituras pro mesmo km (o app deve pegar a menor).
- [ ] Testado com um km que não existe em nenhum trecho (não deve quebrar o app, só ignorar).
- [ ] Testado o caminho de erro (derrubar a API de propósito e ver o botão "Atualizar" ficar vermelho, sem crashar a tela).
- [ ] Se a API exigir autenticação, os headers foram adicionados em `buscarLeiturasApi()`.
