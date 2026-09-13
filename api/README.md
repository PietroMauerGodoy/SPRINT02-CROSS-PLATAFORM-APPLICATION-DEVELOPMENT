# API de Sensores — Motiva

API que recebe as leituras dos sensores (ESP32 + HC-SR04) via `POST` e devolve
o lote pro app Motiva via `GET`, quando alguém aperta **"Atualizar"** no
Kanban. Node.js + TypeScript + Express, dados guardados em memória (sem banco
— reinicia o servidor, zera o buffer).

Contrato completo (formato exato dos dados, regras de negócio que o app já
resolve sozinho, etc.) está em [`../docs/integracao-api-sensores.md`](../docs/integracao-api-sensores.md).
Este README aqui é só sobre **rodar e conectar** a API.

---

## Rodando localmente

```bash
cd api
npm install
npm run dev
```

Isso sobe o servidor em `http://localhost:3000` com auto-reload (qualquer
mudança no código reinicia o servidor sozinho). Pra rodar sem watch mode:

```bash
npm run build   # compila TypeScript -> JavaScript em dist/
npm start       # roda o compilado
```

Testar rápido que está no ar:

```bash
curl http://localhost:3000/
# {"status":"ok","leiturasPendentes":0}
```

---

## Cenário de uso: ESP32 e app na mesma rede WiFi

Essa é a forma mais simples de rodar isso numa demo/apresentação — sem deploy,
sem custo, sem configurar HTTPS. A ideia:

```
┌─────────────┐         WiFi da sala          ┌──────────────────┐
│    ESP32    │ ───POST───▶ 192.168.X.X:3000 ◀───GET─── │  App Motiva (web  │
│ (sensor)    │                                  │  ou celular)      │
└─────────────┘                                  └──────────────────┘
                          ▲
                          │
                 Notebook rodando `npm run dev`
                 (essa API), na mesma rede
```

O notebook que roda `npm run dev` (esta API) precisa estar **na mesma rede
WiFi** que o ESP32 e o dispositivo/navegador rodando o app.

### Passo 1 — Descobrir o IP local do notebook

**Windows** (PowerShell ou CMD):
```powershell
ipconfig
```
Procure por "Endereço IPv4" na sua rede WiFi (geralmente algo como
`192.168.0.X` ou `192.168.1.X`).

**Mac/Linux:**
```bash
ifconfig | grep "inet "
# ou
ip addr show
```

> Esse IP muda toda vez que o notebook troca de rede — se a demo for em outro
> lugar (outra sala, outro WiFi), repita esse passo e atualize os dois
> lugares abaixo.

### Passo 2 — Configurar o ESP32

O firmware do ESP32 deve fazer `POST` pra:
```
http://<IP-DO-NOTEBOOK>:3000/sensores/leituras
```
Content-Type `application/json`, corpo:
```json
{ "id": "5.0", "altura": 12.3 }
```
(`id` = km do ponto onde o sensor está instalado, como texto; `altura` = leitura em cm)

### Passo 3 — Configurar o app Motiva

Edite `src/services/sensoresService.ts` (na raiz do repositório, fora desta
pasta `api/`):

```ts
const BASE_URL = 'http://<IP-DO-NOTEBOOK>:3000/sensores/leituras';
```

E troque `buscarLeiturasMock()` por `buscarLeiturasApi()` dentro de
`buscarLeiturasSensor()` (ver passo a passo completo em
[`../docs/integracao-api-sensores.md`](../docs/integracao-api-sensores.md)).

Se o app estiver rodando **no mesmo notebook** que a API (ex: testando via
`npx expo start --web` no navegador do próprio notebook), `http://localhost:3000/...`
funciona normalmente. O IP da rede (`192.168.X.X`) só é obrigatório quando o
app roda num **dispositivo diferente** do notebook (celular com Expo Go, ou
outro computador) — nesse caso `localhost` apontaria pro próprio dispositivo,
não pro notebook rodando a API.

### Possível bloqueio: Firewall do Windows

Se o ESP32 (ou um celular rodando o app) não conseguir alcançar a API mesmo
na mesma rede, o Firewall do Windows pode estar bloqueando conexões de
entrada na porta 3000. Pra liberar:

1. Painel de Controle → Sistema e Segurança → Firewall do Windows Defender → Configurações avançadas.
2. Regras de Entrada → Nova Regra → Porta → TCP → `3000` → Permitir a conexão.
3. Marque pra Rede Privada (não precisa liberar pra Rede Pública).

---

## Endpoints

| Método | Rota | Uso |
|---|---|---|
| `GET` | `/` | Health-check — confirma que a API está no ar e quantas leituras estão esperando um `GET`. |
| `POST` | `/sensores/leituras` | O ESP32 manda uma leitura (`{ id, altura }`) ou várias de uma vez (array). |
| `GET` | `/sensores/leituras` | O app busca o lote acumulado desde a última chamada — **e o buffer é esvaziado em seguida** (cada sincronização consome o lote inteiro). |

## Estrutura

```
api/
├── src/
│   ├── index.ts          # servidor Express, rotas, CORS
│   ├── armazenamento.ts  # buffer em memória das leituras
│   └── types.ts          # formato LeituraSensorRaw + validação
├── package.json
└── tsconfig.json
```
