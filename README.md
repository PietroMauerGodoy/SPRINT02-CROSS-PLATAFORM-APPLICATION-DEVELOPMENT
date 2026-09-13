# Motiva — Sistema de Priorização de Manutenção de Vegetação Rodoviária

Aplicativo cross-platform (**Expo + React Native + TypeScript**, base de código única para Web e Mobile via `react-native-web`) desenvolvido como parte do Challenge FIAP (2º ano — Ciência da Computação) em parceria com a **CCR Motiva**.

---

## Contexto de negócio

Hoje a manutenção de vegetação nas margens de rodovias (roçada, poda, capina) segue um **cronograma fixo** (ex: a cada 30 dias), independente da real necessidade de intervenção em cada trecho. Isso gera dois problemas:

- **Custo desnecessário** — equipes deslocadas para trechos sem necessidade real de corte.
- **Risco operacional** — trechos que cresceram mais rápido que o previsto ficam sem manutenção até a próxima janela fixa, comprometendo visibilidade e segurança viária.

A proposta do projeto é substituir esse cronograma fixo por um **score de criticidade por trecho**, calculado a partir de:

- dados climáticos (chuva, temperatura) — afetam a taxa de crescimento da vegetação;
- histórico de manutenção — tempo desde a última intervenção no trecho;
- taxa de crescimento estimada por tipo de vegetação/trecho.

O fluxo demonstrado pelo app é: **entrada de dados → processamento (cálculo de criticidade) → saída (priorização de equipes / Kanban)**.

A lógica de severidade do Kanban é inspirada em parâmetros operacionais reais do setor:
- **PER BR-381/MG/SP** (Programa de Exploração da Rodovia) — parâmetros de desempenho para conservação de faixa de domínio e vegetação.
- **Anexo 06 — Lote Rota Sorocabana (ARTESP)** — padrões operacionais de conservação de vegetação (ex: poda ao atingir 30cm em geral / 10cm perto de instalações, prazos de resposta de 24h a 1 semana conforme criticidade, capina mínima de 4x/ano, aceiros 1x/ano).

> Os parâmetros numéricos usados no app (faixas de altura, pesos) são valores de demonstração inspirados nesses documentos — não são os parâmetros contratuais exatos da concessão.

Os trechos mockados usam rodovias **realmente administradas pela Motiva** (não inventadas): **BR-116** (Via Dutra, concessão RioSP), **BR-381** (Fernão Dias) e **SP-330** (Anhanguera, Sistema Motiva Autoban) — ver [Rodovias representadas](#rodovias-representadas).

---

## Contexto acadêmico

- **Instituição:** FIAP
- **Metodologia:** Design Thinking, entregas por sprint (board no Miro + PDF espelhando o Miro)
- **Sprint atual:** Sprint 3 — foco em MVP funcional
- **Equipe:**
  - Fernando Melo — RM 564297
  - Patrick Mansour — RM 562970
  - Pedro Henrique Ribeiro — RM 565090
  - Pietro Mauer — RM 564345
  - Ryan Santos — RM 565102
  - Samir Assad — RM 561562
- **Repositório:** https://github.com/PietroMauerGodoy/SPRINT-CROSS-PLATAFORM-APPLICATION-DEVELOPMENT

---

## Como rodar o projeto

### Pré-requisitos
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Expo Go instalado no celular **ou** navegador web

### Instalação
```bash
git clone <url-do-repositorio>
cd SPRINT-CROSS-PLATAFORM-APPLICATION-DEVELOPMENT
npm install
```

### Executando
```bash
# Web (recomendado para desenvolvimento — é onde o mapa da aba Trechos funciona)
npx expo start --web

# Dispositivo físico via Expo Go
npx expo start
```

### Credenciais de acesso (dados mockados)
| Login | Senha | Nome | Papel | Escopo de acesso |
|---|---|---|---|---|
| `admin` | `123456` | Admin Motiva | Admin | Acesso total ao app, incluindo **Parâmetros do Sistema** e **Gestão de Usuários** |
| `joao` | `123456` | João Silva | Gestor | Acesso operacional completo — todas as equipes, todos os trechos do Kanban, todas as Ocorrências, Dashboard completo, **Gestão de Usuários** (pode atribuir/trocar a equipe de um Operador de Campo). Sem acesso a Parâmetros do Sistema (só Admin) |
| `maria` | `123456` | Maria Santos | Operador de Campo | Só enxerga a **Equipe Alfa** (`#01`) e os trechos do Kanban vinculados a ela (`equipeId: '#01'`) |
| `carlos` | `123456` | Carlos Oliveira | Operador de Campo | Só enxerga a **Equipe Beta** (`#02`) e os trechos do Kanban vinculados a ela (`equipeId: '#02'`) |

Contas ficam definidas em `src/data/mockData.ts` (`mockUsuarios`) e podem ser criadas/editadas de verdade em **Configurações → Gestão de Usuários** (seção visível para Admin e Gestor) — o que for cadastrado ali passa a valer como login imediatamente, porque a tela opera sobre o `UsuariosContext` real (não é mock decorativo).

> Se você alterar `mockUsuarios` no código e um login antigo continuar "colado", é porque já existe uma lista salva em `AsyncStorage` no seu navegador/dispositivo (a mesma lógica de seed usada em `EquipesContext`/`KanbanContext`: só usa o mock se não houver nada salvo ainda). As chaves de armazenamento (`@motiva:usuarios:v2`, `@motiva:usuarioLogado:v2`) já foram versionadas uma vez por esse motivo — se voltar a acontecer, suba a versão da chave de novo em `UsuariosContext.tsx`/`AuthContext.tsx`.

---

## Arquitetura técnica

- **Stack:** TypeScript, Expo SDK 56, React Native 0.85, React Navigation 7 (native-stack), React Context API para estado global, Expo Vector Icons.
- **Projeto unificado:** mesma base de código serve Web (`react-native-web`) e Mobile — não há dois projetos separados. Diferenças de plataforma são tratadas via `Platform.OS` pontualmente (ex: upload de avatar em `PerfilSection.tsx`) e via resolução de arquivo por plataforma do Metro/Expo (`Componente.web.tsx` vs `Componente.tsx`, usado no mapa da aba Trechos — ver [APIs externas](#apis-externas-integradas)).
- **Dados de cadastro (equipes, kanban, ocorrências, usuários) são mockados** em `src/data/mockData.ts`, sem backend próprio. **Clima e geolocalização, porém, vêm de APIs públicas reais** (ver seção abaixo) — não são mais mockados. Estado persistido localmente via `@react-native-async-storage/async-storage` (funciona offline; o clima e o mapa exigem internet).

### Estrutura de pastas
```
src/
├── screens/         # Login, Dashboard, Equipes, Kanban, Ocorrencias, Detalhe, Trechos, Configuracoes
├── components/
│   ├── dashboard/   # KpiCard, SeveridadeDonutChart, CriticidadeTrendChart, RankingTrechosList
│   ├── configuracoes/ # PerfilSection, UsuariosSection, ParametrosSistemaSection, WeightSlider, Toggle, etc.
│   ├── trechos/     # TrechoMapa.web.tsx (Leaflet) / TrechoMapa.tsx (react-native-maps)
│   └── kanban/      # BotaoAtualizarSincronizacao.tsx (sensores IoT)
├── context/         # AuthContext, UsuariosContext, EquipesContext, KanbanContext,
│                    # HistoricoContext, NotificacoesContext, ConfiguracoesContext, OcorrenciasContext,
│                    # SincronizarEquipesKanban (reconciliação Equipes ↔ Kanban)
├── utils/           # permissions.ts (autorização), dashboardMetrics.ts (score de criticidade),
│                    # geo.ts (coordenadas + migração de rodovia legada), id.ts (geração de ID sem colisão),
│                    # equipeKanbanSync.ts (invariante Equipes ↔ Kanban), severidade.ts (calcSeveridade,
│                    # compartilhado entre KanbanScreen e o fluxo de sensores),
│                    # agregacaoSensores.ts (regra do menor valor + mapeamento km → card)
├── hooks/           # useDashboardMetrics.ts
├── services/        # ocorrenciasService.ts (persistência), geocodingService.ts (Nominatim),
│                    # climaService.ts (Open-Meteo), sensoresService.ts (leituras de sensores, mock)
├── types/           # Tipagem centralizada
├── data/            # mockData.ts
├── navigation/      # AppNavigator.tsx (Stack)
└── theme/           # Cores e tokens de design
```

### Gerenciamento de estado
Nove providers envolvem a aplicação em `App.tsx`: `ToastProvider`, `UsuariosProvider`, `AuthProvider`, `ConfiguracoesProvider`, `NotificacoesProvider`, `EquipesProvider`, `KanbanProvider`, `HistoricoProvider`, `OcorrenciasProvider`. Todos com estado persistido em `AsyncStorage`.

### Controle de acesso por papel (RBAC)

O app tem 3 papéis de usuário, cada um com um escopo de dados diferente:

| Recurso | Admin | Gestor | Operador de Campo |
|---|---|---|---|
| Equipes — visualizar | Todas | Todas | **Sem acesso** — item de menu oculto pra esse papel (ver abaixo) |
| Equipes — criar/editar/excluir | Sim | Sim | Não |
| Kanban — visualizar | Todos os trechos | Todos os trechos | Só trechos da própria equipe |
| Kanban — mover card / registrar serviço | Qualquer trecho | Qualquer trecho | Só trechos da própria equipe |
| Kanban — criar/excluir item | Sim | Sim | Não |
| Ocorrências — visualizar | Todas | Todas | Só as vinculadas a trechos da própria equipe |
| Ocorrências — criar/editar/excluir | Sim | Sim | Não |
| Dashboard | Completo (todas as equipes/trechos + tendência histórica) | Completo | Reduzido — só dados da própria equipe; sem gráfico de tendência (histórico é agregado da malha toda, não por equipe) |
| Trechos (mapa + clima) | Todos os trechos | Todos os trechos | Todos os trechos (ainda sem filtro por equipe — mesma limitação do Kanban/Ocorrências) |
| Config → Parâmetros do Sistema | Sim | Não | Não |
| Config → Gestão de Usuários | Sim | Sim (pode atribuir/trocar a equipe de um Operador de Campo) | Não |
| Sidebar — Planejamento / Relatórios | Visível (sem tela própria ainda) | Visível | Oculto |

A autorização é centralizada em `src/utils/permissions.ts` — funções puras (`getEquipesVisiveis`, `getKanbanItemsVisiveis`, `podeGerenciarEquipes`, `podeAcessarParametrosSistema`, `podeGerenciarUsuarios`, `podeVerDashboardCompleto`, `podeCriarOuExcluirOcorrencia`, etc.) que recebem o `Usuario` logado e devolvem o que ele pode ver/fazer. **Nenhuma tela decide isso sozinha com `if (papel === ...)` espalhado no JSX** — a tela só renderiza o que a função de permissão já filtrou.

**Operador de Campo não tem mais acesso à tela "Equipes"** (item de menu escondido nas 6 telas que renderizam a sidebar, reaproveitando `podeVerItemMenuOperacional()` — a mesma checagem central já usada pra Planejamento/Relatórios). A decisão: Operador de Campo é *membro* de uma equipe, não gerencia equipes — quem atribui um Operador a uma equipe é Admin/Gestor. Ele continua acompanhando a própria equipe normalmente pelo Kanban, Ocorrências e Dashboard (reduzido), só não precisa mais de uma tela de gerenciamento de equipes que ele não usa.

**Um Operador de Campo pode estar em mais de uma equipe** — `Usuario.equipeIds` é uma lista (`string[]`), não um valor único. Isso importa porque um operador de campo real pode circular entre trechos diferentes.

**Atribuir um Operador de Campo a uma equipe** dá pra fazer dos dois lados, e os dois sincronizam o mesmo campo (`Usuario.equipeIds`):
- Em **Configurações → Gestão de Usuários**, ao criar/editar um usuário com papel "Operador de Campo", escolhendo uma ou mais equipes numa lista real de chips (multi-seleção).
- Direto na tela **Equipes** (Admin/Gestor), no modal Nova Equipe/Editar: o campo "Responsável" agora é um seletor de chips com os Operadores de Campo cadastrados, mais um chip **"Outro..."** que volta a um texto livre (pra quando o responsável não é um usuário do sistema, ex: um supervisor sem login no app). Escolher um operador **adiciona** essa equipe a `equipeIds` dele (sem tirar as que ele já tinha) — é isso que dá acesso ao Kanban/Ocorrências/Dashboard filtrados por aquela equipe. Não desvincula automaticamente ninguém que já apontava pra essa equipe (uma equipe também pode ter mais de um Operador de Campo).

Esse desenho é intencionalmente "RLS-ready": o projeto não tem banco de dados hoje (é Context API + AsyncStorage), mas cada função em `permissions.ts` foi pensada para virar uma política de RLS real no Postgres/Supabase na Fase 2, sem redesenhar a lógica de autorização — só trocar "onde" ela roda. Ver [`docs/rls-supabase.md`](docs/rls-supabase.md) para o SQL comentado de cada regra (referência, não executável ainda).

Ocorrências têm vínculo real com um trecho do Kanban (`kanbanItemId`, ver seção de domínio abaixo) e são filtradas por papel/equipe do mesmo jeito que Equipes/Kanban: `getOcorrenciasVisiveis()` (`utils/permissions.ts`) resolve o trecho de cada ocorrência e só libera pra Operador de Campo as que pertencem à própria equipe (uma ocorrência cujo trecho não existe mais fica invisível pra quem não tem acesso total, por segurança).

---

## APIs externas integradas

Duas APIs públicas e gratuitas (sem necessidade de credencial/chave) foram integradas para tornar os dados de localização e clima da aba **Trechos** reais, em vez de coordenadas inventadas:

### 1. Open-Meteo (clima em tempo real)
- **Endpoint:** `https://api.open-meteo.com/v1/forecast`
- **Uso no app:** `src/services/climaService.ts` — `buscarClimaAtual(lat, lon)` busca temperatura, precipitação, vento, umidade e código de condição climática (padrão WMO) para a coordenada de cada trecho; `descreverTempo(codigo)` traduz o código WMO para um rótulo em português ("Céu limpo", "Chuva moderada" etc.).
- **Onde aparece:** painel lateral da tela **Trechos**, ao selecionar um trecho no mapa ou na lista — seção "Clima agora".
- Sem chave de API, sem custo, sem limite de uso agressivo — por isso foi escolhida no lugar de serviços pagos (ex: OpenWeather com plano gratuito limitado).

### 2. Nominatim / OpenStreetMap (geocodificação)
- **Endpoint:** `https://nominatim.openstreetmap.org/search`
- **Uso no app:** `src/services/geocodingService.ts` — `geocodificarRodovia(rodovia)` resolve o nome de uma rodovia para uma coordenada real (lat/lon), com cache em memória para não repetir requisições.
- **Onde aparece:** `src/utils/geo.ts` usa essas coordenadas como ponto-base de cada rodovia (`BASE_ROTA`) e desloca cada trecho a partir dela conforme o km inicial (`coordenadasAproximadas`). As 3 rodovias do mock (BR-116, BR-381, SP-330) já têm coordenadas reais fixas, geocodificadas uma vez; `corrigirComGeocodingSeNecessario()` geocodifica **rodovias novas** que ainda não estão no `BASE_ROTA`, de forma assíncrona, sem travar a criação do item — chamado a partir do fluxo de criar/editar item em `EquipesScreen.tsx`/`KanbanScreen.tsx`. Alcançável pela UI: os formulários de Equipes e Kanban têm um chip **"Outra..."** ao lado da lista fixa de rodovias que revela um campo de texto livre — digitar uma rodovia nova ali (ex: `SP-348`) dispara essa geocodificação de verdade (testado ao vivo: a coordenada final bate com a resposta real da Nominatim). Editar a rodovia de uma equipe existente também propaga a mudança para o(s) trecho(s) dela no Kanban, recalculando a coordenada.
- **Limitação real da API:** Nominatim resolve **nome de lugar**, não "rodovia + km exato" — uma rodovia de centenas de km retorna um único ponto onde o OpenStreetMap identificou aquele nome (por isso as buscas usam qualificadores de cidade, ex: `"Rodovia Anhanguera, Jundiaí, São Paulo, Brazil"`, para cair perto da região metropolitana de SP em vez de um ponto aleatório ao longo da rodovia). Para precisão de "km exato do trecho" seria necessário uma base de dados rodoviária real como o **SNV do DNIT**, fora do escopo atual.
- Respeita a política de uso da Nominatim (User-Agent identificando o projeto, sem paralelizar requisições agressivamente).

### Mapa
A aba Trechos tem um componente de mapa por plataforma — mesma interface de props (`trechos`, `selecionadoId`, `onSelecionar`), o Metro/Expo escolhe o arquivo certo sozinho (convenção `.web.tsx` vs `.tsx`):

- **Web** — `src/components/trechos/TrechoMapa.web.tsx`: **Leaflet** (`react-leaflet`) com tiles do **OpenStreetMap**, ambos gratuitos e sem chave — em vez de Google Maps Platform (que exige cartão de crédito e cobra acima do free tier).
- **Mobile (iOS/Android)** — `src/components/trechos/TrechoMapa.tsx`: **`react-native-maps`**, mesma lógica de marcadores coloridos por severidade e seleção de trecho. No iOS usa Apple Maps (sem chave). No Android usa Google Maps — dentro do **Expo Go** funciona com a chave de desenvolvimento que o próprio Expo Go já embute (não precisa configurar nada pra testar); só uma build standalone/EAS precisaria de uma chave própria em `app.json` → `android.config.googleMaps.apiKey`.

> **Não testado num dispositivo/simulador físico ainda** — só validado por `tsc --noEmit` e revisão de código, já que este ambiente de desenvolvimento não tem acesso a um simulador iOS/Android nem a um aparelho conectado. Antes de considerar esse ponto fechado de verdade, abra a aba Trechos num celular com Expo Go e confirme que o mapa renderiza e os marcadores respondem ao toque.

---

## Score de criticidade (Dashboard e ranking de priorização)

O score que prioriza trechos no Dashboard (`utils/dashboardMetrics.ts` → `scorePriorizacao`) é uma **média ponderada real**, não mais decorativa:

```
score = pesoManutencao   × fatorManutencao(dias desde o último serviço)
      + pesoClima        × fatorClima(clima real do trecho via Open-Meteo)
      + pesoCrescimento  × FATOR_CRESCIMENTO_SEVERIDADE (0–100, conforme severidade atual do trecho)
```

Os três pesos (`pesoManutencao`, `pesoClima`, `pesoCrescimento`) vêm dos **sliders de Parâmetros do Sistema** (`Configurações → Parâmetros do Sistema`, só Admin) — antes eram puramente visuais, agora alimentam de verdade o cálculo via `useDashboardMetrics.ts` → `useConfiguracoes()`. Mudar um peso e voltar ao Dashboard reordena o ranking de priorização na hora.

O fator de clima (`fatorClima` em `dashboardMetrics.ts`) usa o clima **real** de cada trecho, buscado via Open-Meteo (mesma API da aba Trechos): `useDashboardMetrics.ts` dispara uma busca por trecho (cacheada por `id`, uma requisição por coordenada única) e alimenta o score assim que a resposta chega — o Dashboard recalcula o ranking sozinho quando os dados de clima terminam de carregar. Fórmula: 50% umidade relativa + 35% temperatura (crescente de 15°C a 30°C) + 15% precipitação instantânea — uma calibração de demonstração (não um modelo agronômico validado), documentada no código. Enquanto a resposta de um trecho específico não chega (ou falha), esse trecho cai para o fallback neutro `FATOR_CLIMA_NEUTRO = 50`, então o Dashboard nunca trava esperando a API.

---

## Domínio: Ocorrências ↔ Trechos (Kanban)

Cada `Ocorrencia` tem `kanbanItemId`, uma referência real para um `KanbanItem` (`trecho`) — não mais um campo de texto livre (`local: string`). Isso significa que:

- Ao criar/editar uma ocorrência, o formulário mostra os trechos reais como opções (chips com rodovia + km + equipe), em vez de um campo de texto digitado à mão.
- O card de ocorrência (`OcorrenciaCard.tsx`) e a tela de detalhe (`DetalheScreen.tsx`) resolvem o trecho vinculado (`useKanban()` + `find`) para mostrar rodovia, km e equipe responsável.
- A exportação CSV (`IntegracoesSection.tsx`) deriva a coluna de local a partir do trecho vinculado, não de um campo solto.

Os dados mockados de Ocorrências também foram realinhados ao domínio do projeto — cenários de vegetação/rodovia (ex: "Vegetação encobrindo placa de sinalização", "Galho caído sobre o acostamento", "Erosão na margem próxima à drenagem") em vez dos cenários de fábrica que existiam antes (vazamento de óleo, EPI, prensa hidráulica).

### Rodovias representadas
Os 10 trechos mockados (`K01`–`K10`) usam 3 rodovias **confirmadas como administradas pela Motiva**:
- **BR-116** (Via Dutra — concessão RioSP)
- **BR-381** (Fernão Dias)
- **SP-330** (Anhanguera — Sistema Motiva Autoban)

> Uma versão anterior usava `SP-280` (Rodovia Castelo Branco) por engano — essa rodovia pertence a outra concessionária (ViaOeste), não à Motiva, e foi substituída por SP-330.

---

## Sincronização de Sensores IoT

Além dos dados mockados e das APIs de clima/geocodificação, o Kanban tem um fluxo pensado pra receber leituras reais de sensores de altura de vegetação em campo — hoje simulado por um mock, mas com a mesma forma que o dado real vai ter.

> **Vai implementar a API de verdade?** Ver [`docs/integracao-api-sensores.md`](docs/integracao-api-sensores.md) — guia completo com o contrato exato esperado, onde plugar o endpoint (3 passos, um arquivo só) e um checklist de teste. O resumo abaixo é só pra quem quer entender o fluxo, não pra quem vai implementar.

**Fluxo (ESP32 → API → botão "Atualizar"):** um ESP32 com sensor ultrassônico (HC-SR04) instalado no acostamento faz `POST` direto, via WiFi, pra uma API própria — sem LoRa, sem gateway intermediário. O app **nunca recebe esse POST**: ele funciona em modo *pull*, buscando (`GET`) o lote de leituras disponível só quando alguém aperta **"Atualizar"** ao lado do filtro de Rodovias no Kanban (visível só pra Admin/Gestor — Operador de Campo não sincroniza sensores, mesma regra de quem pode criar/excluir item do Kanban). Hoje essa busca é 100% mock (`src/services/sensoresService.ts`, função `buscarLeiturasSensor()`), com um `// TODO` marcando exatamente onde entra o `fetch` real — nada em quem consome (Context, botão) muda quando a API existir de verdade.

> **Pra quem for plugar a API real:** todo o trabalho fica isolado em `src/services/sensoresService.ts` — nenhum outro arquivo precisa mudar. O arquivo já tem uma função `buscarLeiturasApi()` pronta e funcional (`fetch` + tratamento de status/formato de resposta), só comentada/não usada ainda. Os passos são:
> 1. Preencher a constante `BASE_URL` no topo do arquivo com o endpoint real (GET, sem parâmetros, sem autenticação prevista hoje — se a API real exigir header/token, é só adicionar dentro de `buscarLeiturasApi()`).
> 2. Dentro de `buscarLeiturasSensor()`, trocar a chamada de `buscarLeiturasMock()` pra `buscarLeiturasApi()`.
> 3. Apagar `buscarLeiturasMock()` (não é mais usada).
>
> **Contrato que a API precisa respeitar** pra tudo funcionar sem mais nenhuma mudança de código: responder `200` com um **array JSON no corpo** (não um objeto envelopado como `{ data: [...] }`), onde cada item é `{ "id": string, "altura": number }` — `id` é o km do ponto de medição como texto (ex: `"5.0"`), `altura` é a altura da vegetação em cm. `buscarLeiturasApi()` já valida que a resposta é um array antes de devolver; se a API real vier num formato diferente, vai falhar ali com uma mensagem clara em vez de quebrar silenciosamente na agregação.

**Formato da leitura:** cada leitura crua (`LeituraSensorRaw`) é `{ id: string; altura: number }`, onde `id` é o km do ponto de medição (ex: `"5.0"`) e `altura` é a altura da vegetação em cm naquele ponto.

**Regra do menor valor:** quando várias leituras chegam pro mesmo km, ou pra kms diferentes que caem dentro do range `kmInicio`–`kmFim` do mesmo card, a leitura aplicada é sempre a de **menor altura** — nunca a mais recente, nunca uma média. Isso é porque o sensor ultrassônico mede a distância até o topo da vegetação, e reflexão/ângulo de leitura tendem a fazer o sensor "enxergar" uma altura maior do que a real — entre várias leituras do mesmo trecho no mesmo lote, a menor é a mais confiável. Essa redução acontece em duas camadas: `agregarLeiturasPorMenorValor()` (`utils/agregacaoSensores.ts`) já reduz leituras de km idêntico antes de mais nada; depois, `KanbanContext.aplicarLeiturasSensor()` reduz de novo, agora por **card** (já que kms diferentes podem cair no range do mesmo trecho), garantindo que o card final sempre reflita a menor leitura entre todas as que o atingiram naquele lote.

**Mapeamento km → card:** `encontrarCardPorKm()` (mesmo arquivo) acha o `KanbanItem` cujo range `kmInicio <= km <= kmFim` contém o km da leitura. Uma leitura cujo km não cai em nenhum card é **ignorada silenciosamente** (só um `console.warn` pra debug, sem popup de erro) — o app nunca cria um card novo automaticamente a partir de uma leitura órfã.

**Depois de aplicar:** cada card afetado tem `alturaAtual` atualizada e a severidade recalculada via `calcSeveridade()` (a mesma função usada em todo o resto do Kanban — extraída de `KanbanScreen.tsx` pra `utils/severidade.ts` justamente pra ser compartilhada aqui sem duplicar a regra), e uma notificação "Sensores sincronizados" é disparada informando quantos cards foram atualizados.

**Visual do botão** (`src/components/kanban/BotaoAtualizarSincronizacao.tsx`):

| Estado | Ícone | Cor | Texto |
|---|---|---|---|
| `idle` | `sync-outline` | branco | "Atualizar" |
| `sincronizando` | `sync-outline` (girando, `Animated.loop`) | branco | "Atualizando..." |
| `sucesso` | `checkmark` | verde | — (volta a `idle` após 1.2s) |
| `erro` | `alert-circle-outline` | vermelho | — (volta a `idle` após 1.2s) |

Testado ao vivo: Operador de Campo (Maria) não vê o botão; Admin vê, sincroniza e os cards afetados atualizam altura/severidade na hora (incluindo o caso de duas leituras de kms diferentes caindo no mesmo card — o resultado final foi a menor das duas), a leitura órfã gerou o `console.warn` esperado sem quebrar nada, e a notificação com a contagem certa de cards apareceu no sino.

---

## O que está pronto

| Área | Status |
|---|---|
| **Login** | Validação contra `UsuariosContext` (real, com CRUD — não mais um array estático); `AppNavigator` só monta a pilha autenticada quando há sessão — sem guard solto por tela |
| **Controle de acesso (RBAC)** | 3 papéis (Admin/Gestor/Operador de Campo); Equipes, Kanban, Dashboard, Ocorrências, Trechos, Configurações e a sidebar de todas as telas filtram dados/ações/menu por papel; documentação de RLS futura em [`docs/rls-supabase.md`](docs/rls-supabase.md) |
| **Equipes** | CRUD completo, filtros, paginação (7/página), sincronizado com Kanban (com reconciliação automática — `SincronizarEquipesKanban` — pra nenhuma equipe ficar "órfã"), visível conforme papel |
| **Kanban de vegetação** | 4 colunas por severidade (Sem Ocorrência 0–9cm, Leve 10–19cm, Grave 20–29cm, Crítico ≥30cm — faixas calibradas para que "Crítico" comece no limite geral de poda do Anexo 06/ARTESP), drag-and-drop (mouse e toque, via `PanResponder`), CRUD de itens, sincronizado com Equipes, **sincronização de sensores IoT** (botão "Atualizar", só Admin/Gestor — ver [Sincronização de Sensores IoT](#sincronização-de-sensores-iot)), visível conforme papel |
| **Ocorrências** | CRUD completo (criar, listar, ver detalhe, **editar**, **excluir**), paginação (7/página), vínculo real com trecho (`kanbanItemId`), **filtrada por papel/equipe** (Operador de Campo só vê as do próprio trecho), tudo persistido via `OcorrenciasContext` |
| **Trechos (novo)** | Aba com mapa real mostrando todos os trechos coloridos por severidade (Leaflet/OpenStreetMap na Web, `react-native-maps` no mobile — ver [Mapa](#mapa)), busca/filtro por rodovia, painel lateral com clima em tempo real (Open-Meteo) do trecho selecionado, coordenadas geocodificadas de verdade (Nominatim) |
| **Dashboard operacional** | KPIs (trechos críticos, equipes em campo, % SLA, **tempo médio de resposta real**), gráfico de tendência e donut de severidade (`react-native-svg`), **ranking de priorização com score de criticidade real** — ponderado pelos sliders de Parâmetros do Sistema **e pelo clima real (Open-Meteo) de cada trecho** —, histórico com seed de demonstração + gravação real diária (`HistoricoContext`) |
| **Notificações** | Sino global, badge, painel, histórico, geradas por CRUD |
| **Configurações** | Perfil (nome/e-mail/senha/foto — foto por usuário via `Usuario.avatar`), Preferências, Notificações (2 toggles reais), Gestão de Usuários (CRUD real, ligado ao login — testado criando conta de cada papel e validando o RBAC), **Parâmetros do Sistema (pesos de criticidade conectados de verdade ao score do Dashboard)**, Integrações, Dados do Sistema — com persistência e toasts |

## O que está incompleto / é a próxima prioridade

- **Achado de acessibilidade (paleta de severidade):** as cores de severidade do Kanban (reaproveitadas no Dashboard) falham no validador de contraste para daltonismo — Crítico (vermelho) e Leve (verde) são difíceis de distinguir sob deuteranopia. Mitigado com texto/número sempre visível junto da cor, mas a paleta em si não foi alterada (decisão de identidade visual do app, fora do escopo até agora).
- **Seletor de idioma decorativo:** `Configurações → Preferências → Idioma` salva o valor escolhido, mas não existe nenhuma lib de i18n no projeto — nada na tela é traduzido de fato.
- **"Modo compacto" só afeta a tabela de Equipes** — Kanban, Ocorrências e outras listas ainda não reagem a essa preferência.
- **Mapa nativo (`react-native-maps`) não confirmado num dispositivo/simulador real** — implementado e sem erro de `tsc`, mas este ambiente de desenvolvimento não tem simulador iOS/Android nem aparelho conectado pra validar visualmente (diferente do mapa Web, testado ao vivo). Ver [Mapa](#mapa).
- **API real de sensores IoT ainda não existe** — `sensoresService.ts` é 100% mock hoje (por decisão explícita: a ideia desta etapa era validar o visual/fluxo do botão "Atualizar" antes do backend do ESP32 estar pronto). A troca pro `fetch` real é isolada nesse arquivo (`// TODO` marcando onde entra) e não deve exigir tocar em `KanbanContext` nem no componente do botão.

De 5 toggles que existiam em `Configurações → Notificações`, só 2 tinham função real (`Nova ocorrência crítica` e `Mudança de status de equipe`); os outros 3 (`Prazo de trecho vencendo`, `Relatório semanal disponível`, `Receber também por e-mail`) foram escondidos por não terem nenhuma feature real por trás (não existe sistema de prazo de trecho, geração de relatório semanal, nem envio de e-mail no app hoje).

---

## Fluxo de persistência (Ocorrências)

A persistência de Ocorrências é ponta a ponta e sobrevive a fechar/reabrir o app:

1. **Criar** — na tela Ocorrências, botão "Nova Ocorrência" abre um modal de cadastro (com chips de trecho real em vez de texto livre). Ao salvar, `OcorrenciasScreen` chama `adicionarOcorrencia()` do `OcorrenciasContext`, que delega para `adicionarOcorrenciaService()` em `src/services/ocorrenciasService.ts`. O service gera o `id` (via `gerarId()`, contador monotônico — ver Bugs conhecidos), grava a lista inteira no `AsyncStorage` (chave `@motiva:ocorrencias`) e retorna o `id` novo.
2. **Listar** — depois de salvar, o Context recarrega a lista com `listarOcorrencias()` (lida do `AsyncStorage`) e atualiza o estado (`useState<Ocorrencia[]>`) — a tela de lista re-renderiza automaticamente com o item novo, sem precisar reiniciar o app. A lista é paginada (7 itens/página).
3. **Ver detalhe** — ao tocar em um card, `OcorrenciasScreen` navega para `DetalheScreen` passando a ocorrência; a tela também busca a versão mais atual via `buscarPorId()` do Context, garantindo que o detalhe reflita qualquer atualização já persistida. A partir daqui dá pra **editar** (reabre o mesmo formulário de criação, pré-preenchido) ou **excluir** (com modal de confirmação, restrito a quem tem permissão via `podeCriarOuExcluirOcorrencia`).
4. **Reabrir o app** — no boot, `OcorrenciasProvider` roda `carregarOcorrencias()` em um `useEffect`, que lê do `AsyncStorage` e usa isso (não o mock) como fonte de dados sempre que já existir algo salvo. O mock (`mockOcorrencias`) só é usado como seed na primeira execução, quando ainda não há nada gravado.

O mesmo padrão (Context + service/`AsyncStorage`, mock só como seed inicial) é usado também em `EquipesContext` e `KanbanContext`. O `KanbanContext` tem uma camada extra de proteção: uma função de migração (`comMetadadosCompletos()`) roda no carregamento e corrige/completa `lat`/`lon`, `entrouNaSeveridadeEm` e rodovias legadas (`migrarRodoviaLegada()`, ver `utils/geo.ts`) ausentes ou inválidos em dados salvos antes dessas mudanças de schema — sem isso, dados antigos no `AsyncStorage` quebrariam o mapa da aba Trechos ou ficariam presos numa rodovia incorreta (ver Bugs conhecidos). `EquipesContext` aplica a mesma migração de rodovia legada.

Além disso, `SincronizarEquipesKanban` (`src/context/SincronizarEquipesKanban.tsx`, montado no `App.tsx` dentro dos providers de Equipes e Kanban) garante um invariante entre os dois: toda equipe com status diferente de "Inativo" tem pelo menos um card no Kanban. Ele roda uma vez, só depois que `EquipesContext` e `KanbanContext` terminam de hidratar, e cria automaticamente o card que faltar — cobre qualquer forma de os dois ficarem fora de sincronia (dado de uma versão anterior do app, edição direta do armazenamento etc.), não só o fluxo normal de criação pela tela.

---

## Bugs conhecidos

1. ~~Botão de configurações morto no Kanban~~ — **corrigido.** `KanbanScreen.tsx` agora usa o mesmo `AppHeader` das outras telas, com a engrenagem navegando para Configurações.
2. ~~Sem guard de autenticação no navigator~~ — **corrigido.** `AppNavigator.tsx` só registra as rotas autenticadas quando existe um `usuario` logado; sem sessão, só a rota `Login` existe na pilha (nem por navegação programática dá pra alcançar as outras). Antes, todas as telas ficavam sempre registradas e cada tela fazia `navigation.replace('Login')` manualmente no logout.
3. ~~Colisão de ID em criações rápidas~~ — **corrigido.** `ocorrenciasService`, `ConfiguracoesContext` (log de atividades) e `NotificacoesContext` geravam IDs só com `Date.now()`, que colide sob chamadas síncronas rápidas. Agora usam `gerarId()` (`src/utils/id.ts`), um contador monotônico — testado com 500 mil chamadas em loop apertado, zero colisões.
4. ~~Foto de perfil compartilhada entre contas~~ — **corrigido.** A foto ficava num estado global (`ConfiguracoesContext`), então trocar a foto de um usuário trocava a de todo mundo logado naquele navegador. Movida para `Usuario.avatar`, por conta.
5. ~~Toggle verde em vez de roxo~~ — **corrigido.** O `Switch` nativo do React Native não respeita `trackColor` de forma confiável no `react-native-web` (cai no estilo padrão do navegador). `Toggle.tsx` foi reescrito como componente próprio.
6. ~~Dados mockados de Ocorrências fora do domínio~~ — **corrigido.** Cenários reescritos para vegetação/rodovia, e o vínculo de local passou de texto livre (`local`) para referência real a um trecho (`kanbanItemId`) — ver [Domínio: Ocorrências ↔ Trechos](#domínio-ocorrências--trechos-kanban).
7. ~~Erro de console no gráfico donut do Dashboard (`transform-origin` inválido)~~ — **corrigido.** Bug real da lib `react-native-svg` (15.x) no `react-native-web`: o componente `<G rotation origin>` gera a propriedade DOM `transform-origin` (kebab-case) em vez de `transformOrigin`, disparando warning do React DOM. Removido o uso de `<G rotation>` em `SeveridadeDonutChart.tsx`; a rotação agora é calculada diretamente no `strokeDashoffset` de cada `Circle`. Verificado visualmente que o resultado é idêntico ao anterior, sem erros no console.
8. ~~Crash "Invalid LatLng object: (NaN, NaN)" ao abrir a aba Trechos~~ — **corrigido.** Dados de Kanban salvos no `AsyncStorage` antes da introdução dos campos `lat`/`lon` não tinham essas coordenadas, e o mapa quebrava ao tentar centralizar em `NaN`. Corrigido em duas camadas: migração automática no carregamento (`comCoordenadas()` em `KanbanContext.tsx`, que recalcula coordenadas ausentes/inválidas) e um filtro defensivo no próprio mapa (`TrechoMapa.web.tsx`) que ignora qualquer marcador sem coordenada válida em vez de quebrar a tela toda.
9. ~~Rodovia mockada `SP-280` não pertence à Motiva~~ — **corrigido.** `SP-280` (Castelo Branco) é uma concessão da ViaOeste, não da Motiva. Substituída por `SP-330` (Anhanguera, Sistema Motiva Autoban) em todos os trechos, filtros e coordenadas.
10. ~~Fator de clima do score de criticidade era neutro/fixo~~ — **corrigido.** `fatorClima()` (`dashboardMetrics.ts`) agora usa o clima real de cada trecho (Open-Meteo), buscado e cacheado por `useDashboardMetrics.ts`; o ranking de priorização do Dashboard recalcula sozinho quando os dados de clima terminam de carregar. Ver [Score de criticidade](#score-de-criticidade-dashboard-e-ranking-de-priorização).
11. ~~"Tempo médio de resposta" sempre mostrava "—"~~ — **corrigido.** `KanbanItem` ganhou o campo `entrouNaSeveridadeEm` (data ISO), atualizado automaticamente pelo `KanbanContext.atualizarItem` sempre que a severidade de um trecho muda (drag-and-drop ou edição) — dados antigos no `AsyncStorage` sem esse campo são migrados no carregamento (fallback: data de hoje, mesma lógica já usada para lat/lon). `tempoMedioRespostaDias()` agora calcula a média real de dias entre um trecho entrar na severidade atual e o `ultimoServico` registrado nele (só conta serviços feitos depois da entrada na severidade).
12. ~~`SP-280` gravado no `AsyncStorage` antes da correção travava a rodovia errada pra sempre~~ — **corrigido.** A troca de `SP-280` por `SP-330` no mock (bug #9) só ajudava instalações novas — quem já tinha equipes/trechos salvos continuava vendo `SP-280` porque o mock só é usado como seed na primeira execução. Adicionada uma migração de verdade (`migrarRodoviaLegada()` em `utils/geo.ts`, usada por `EquipesContext` e `KanbanContext` no carregamento) que reescreve qualquer `SP-280` salvo para `SP-330` e recalcula a coordenada do trecho.
13. ~~Equipe criada podia ficar "órfã" (sem card no Kanban)~~ — **corrigido.** O fluxo normal de criar equipe sempre gerava um card no Kanban, mas qualquer equipe que ficasse fora desse fluxo (dado de uma versão anterior do app, ou qualquer outra forma de os dois ficarem fora de sincronia) nunca era corrigida — a equipe aparecia em Equipes mas nunca no Kanban. Adicionado `SincronizarEquipesKanban` (`src/context/SincronizarEquipesKanban.tsx`, montado no `App.tsx`), que roda uma vez após `EquipesContext` e `KanbanContext` hidratarem e cria automaticamente o card que falta pra qualquer equipe com status diferente de "Inativo" sem nenhum trecho vinculado.
14. *(Validado, não reproduzido)* possível bug de validação assíncrona em `ParametrosSistemaSection.salvar()` — testado ao vivo (campo vazio → bloqueia salvar com toast de erro; corrigido → salva com sucesso). A função é inteiramente síncrona, sem `async`/`await`. Não reproduzido.
15. ~~Geocodificação de rodovia nova não era alcançável pela UI~~ — **corrigido.** `corrigirComGeocodingSeNecessario()` (Nominatim) já existia e funcionava, mas `EquipesScreen` e `KanbanScreen` só ofereciam uma lista fixa de rodovias (chips), sem campo de texto livre. Adicionado um chip **"Outra..."** nos dois formulários (criar/editar) que revela um `TextInput` pra digitar qualquer rodovia — testado ao vivo criando uma equipe com `SP-348`: a chamada real à Nominatim disparou e a coordenada final no `AsyncStorage` bateu exatamente com a resposta da API. De quebra, editar a rodovia de uma equipe existente agora também atualiza o(s) trecho(s) dela no Kanban (antes só a Equipe mudava, o Kanban ficava com a rodovia antiga).
16. *(Validado)* Drag-and-drop do Kanban em touch — `PanResponder` (compatível com mouse e toque, em vez das APIs de mouse do DOM) testado com um gesto de toque real via `Input.dispatchTouchEvent` do protocolo DevTools do Chromium (a simulação de toque mais fiel possível sem um dispositivo físico — dispara o mesmo evento nativo `touchstart`/`touchmove`/`touchend` que um celular real gera, com hit-test do próprio navegador a cada ponto do gesto): arrastar um card por toque abriu o modal de confirmar altura e moveu o card de coluna corretamente, sem erros de console. Ainda vale um teste manual num dispositivo físico via Expo Go antes da entrega final, mas o caminho de código já está confirmado funcional sob toque.
17. ~~Ocorrências não eram filtradas por equipe/papel~~ — **corrigido.** `Ocorrencia` não guarda `equipeId` diretamente (só `kanbanItemId`), então `getOcorrenciasVisiveis()` (novo, em `utils/permissions.ts`) resolve o trecho vinculado de cada ocorrência e libera pra Operador de Campo só as do trecho da própria equipe (contadores do topo da tela e a lista/paginação usam a mesma fonte já filtrada). Testado ao vivo com os 3 papéis: Admin via as 5 ocorrências do mock, Carlos (Equipe Beta) via só a 1 vinculada a um trecho da Beta, Maria (Equipe Alfa) via 0 (nenhuma ocorrência mockada pertence a um trecho da Alfa) — estado vazio renderiza normalmente, sem erros de console.
18. ~~Card "fantasma" no Kanban apontando pra uma equipe já excluída~~ — **corrigido.** Espelho do bug #13 (equipe sem card): um card do Kanban com `equipeId` apontando pra uma equipe que não existe mais ficava visível no Kanban mas invisível em Equipes — inconsistente, e foi exatamente o que aconteceu com a conta da Maria (Operador de Campo via um card "Equipe Alfa" no Kanban, mas "Equipes" mostrava vazio). `cardsOrfaos()` (novo, em `utils/equipeKanbanSync.ts`) detecta esses cards e `SincronizarEquipesKanban` os remove automaticamente no carregamento. De quebra, excluir uma equipe agora também desvincula (`equipeId: undefined`) qualquer usuário que apontava pra ela (`UsuariosContext.desvincularEquipe()`, chamado em `EquipesScreen.confirmarDelete()`), pra esse tipo de inconsistência não voltar a acontecer daqui pra frente. Testado ao vivo nos dois sentidos: reproduzi o estado quebrado via `localStorage` e confirmei que o card fantasma some sozinho no carregamento; e excluí uma equipe pela UI real e confirmei que o usuário vinculado a ela ficou sem `equipeId`.
19. ~~Operador de Campo tinha acesso à tela "Equipes"~~ — **redesenhado, por pedido explícito.** Operador de Campo é membro de uma equipe, não gerencia equipes — ter acesso a essa tela não fazia sentido pro papel (e foi o que expôs o bug #18). O item "Equipes" agora fica oculto da sidebar pra esse papel nas 6 telas que a renderizam (reaproveitando `podeVerItemMenuOperacional()`, a mesma checagem central já usada pra Planejamento/Relatórios — nenhum `if` de role novo). Testado ao vivo: Maria (Operador) não vê mais "Equipes" em nenhuma das 4 telas com sidebar testadas; Admin continua vendo normalmente.
20. ~~Não tinha como atribuir um Operador a uma equipe direto na tela Equipes~~ — **implementado, por pedido explícito.** O campo "Responsável" do modal Nova Equipe/Editar virou um seletor de chips com os Operadores de Campo cadastrados (mais um chip "Outro..." pra texto livre, pra responsável sem login no sistema). Escolher um operador sincroniza `equipeIds` dele com essa equipe na hora (`editarUsuario`, chamado de `EquipesScreen.handleSalvar`) — o mesmo campo que já controlava o que ele vê no Kanban/Ocorrências/Dashboard, agora acessível dos dois lados (Gestão de Usuários e Equipes). Testado ao vivo: criei uma equipe como Gestor escolhendo "Maria Santos" como responsável, confirmei `maria.equipeIds` atualizado no storage, e loguei como Maria confirmando que o novo trecho já aparecia no Kanban dela.
21. ~~Atribuir uma segunda equipe a um Operador substituía a primeira~~ — **corrigido.** `Usuario.equipeId` era um campo único (`string`) — um Operador de Campo só podia estar em uma equipe por vez, e atribuir uma equipe nova sobrescrevia a anterior em vez de somar. Virou `Usuario.equipeIds: string[]`, com migração automática pra quem já tinha o formato antigo salvo (`comEquipeIds()` em `UsuariosContext.tsx`, sem perder o vínculo existente). `permissions.ts` (visibilidade de Equipes/Kanban/Ocorrências), Gestão de Usuários (agora multi-seleção de equipes) e o seletor de "Responsável" na tela Equipes foram todos atualizados pra tratar isso como lista. Testado ao vivo: migrei um usuário salvo no formato antigo e confirmei o acesso preservado; atribuí duas equipes novas pra Maria em sequência e confirmei que ela ficou com as três (a original do mock + as duas novas) — nenhuma foi perdida.
22. *(Investigado, não era bug)* Card de uma equipe recém-criada "sumia" do Kanban depois de criar outra equipe em seguida — tentei reproduzir a sequência relatada (criar → excluir → criar de novo reaproveitando o número do id) duas vezes num ambiente limpo e os dois cards sempre ficaram corretos. A causa real era outra: o ícone de "alternar status" (setas azuis, ao lado de Editar/Excluir) desativa a equipe com um único clique direto, sem confirmação — e equipe "Inativo" nunca tem card no Kanban (comportamento correto, documentado desde o início). Um clique acidental nesse ícone já bastava pra parecer que um card "sumiu". Corrigido o UX real do achado: **desativar agora pede confirmação** (modal igual ao de excluir, avisando que o card some do Kanban), reativar continua direto (não tem efeito destrutivo). De quebra, endureci `EquipesContext.adicionarEquipe()`: o cálculo do próximo número de id agora lê sempre do estado mais recente dentro do updater funcional do `setEquipes`, em vez de um valor capturado no closure — evita qualquer colisão teórica de id sob chamadas rápidas em sequência.

---

## Navegação

```
Login
  └── Dashboard ──┬── Equipes ──┬── Kanban
                  ├── Kanban    ├── Ocorrencias ── Detalhe
                  ├── Ocorrencias
                  └── Trechos
       (Dashboard, Equipes, Kanban, Ocorrencias e Trechos também acessam Configuracoes)
```

---

## Tecnologias

| Tecnologia | Versão | Uso |
|---|---|---|
| Expo SDK | 56 | Plataforma base |
| React Native | 0.85 | Framework UI |
| React | 19.2 | Runtime |
| TypeScript | 6.x | Tipagem estática |
| React Navigation | 7.x | Navegação (Stack) |
| React Context API | — | Estado global |
| AsyncStorage | — | Persistência local |
| Expo Vector Icons | — | Ícones (Ionicons, MaterialIcons) |
| React Native Web | — | Suporte a navegador |
| react-native-svg | 15.x | Gráficos do Dashboard (donut, tendência) — sem lib de charting externa |
| Leaflet / react-leaflet | 5.x | Mapa interativo da aba Trechos na Web, tiles do OpenStreetMap |
| react-native-maps | — (via `expo install`) | Mapa interativo da aba Trechos no mobile — Apple Maps (iOS) / Google Maps (Android) |
| Open-Meteo API | — | Clima em tempo real por trecho (gratuita, sem chave) |
| Nominatim (OpenStreetMap) | — | Geocodificação de rodovia → coordenada real (gratuita, sem chave) |
