# Papéis e Permissões — Admin, Gestor e Operador de Campo

Guia de referência do que cada papel pode ver e fazer no app **Motiva**. Toda
regra aqui vem de um único lugar no código — `src/utils/permissions.ts` — e
nenhuma tela decide isso sozinha (nada de `if (papel === 'admin')` espalhado
pelas telas). Se você mudar uma regra, muda só ali.

---

## Os 3 papéis, em uma frase cada

| Papel | Resumo |
|---|---|
| **Admin** | Acesso total ao sistema, incluindo as configurações estruturais (parâmetros de criticidade, gestão de usuários). |
| **Gestor** | Mesmo acesso operacional do Admin (vê/gerencia tudo — equipes, trechos, ocorrências, usuários), mas **não** mexe nos Parâmetros do Sistema. |
| **Operador de Campo** | Só enxerga e age sobre os trechos/ocorrências **da(s) própria(s) equipe(s)**. Não gerencia nada estrutural. |

Admin e Gestor são tratados como o mesmo "nível" na maior parte do app — a
função interna `temAcessoTotal(usuario)` (`permissions.ts`) retorna `true` pra
ambos. A única coisa que separa um do outro é **Parâmetros do Sistema**, que é
exclusivo do Admin.

---

## Tabela geral

| Recurso | Admin | Gestor | Operador de Campo |
|---|:---:|:---:|:---:|
| Ver Equipes | ✅ todas | ✅ todas | ❌ (sem acesso à tela — ver nota abaixo) |
| Criar / editar / excluir Equipe | ✅ | ✅ | ❌ |
| Ver Kanban | ✅ todos os trechos | ✅ todos os trechos | ✅ só trechos da própria equipe |
| Mover card / registrar serviço no Kanban | ✅ qualquer trecho | ✅ qualquer trecho | ✅ só trechos da própria equipe |
| Criar / excluir card do Kanban | ✅ | ✅ | ❌ |
| Ver Ocorrências | ✅ todas | ✅ todas | ✅ só as vinculadas a trechos da própria equipe |
| Criar / editar / excluir Ocorrência | ✅ | ✅ | ❌ (só visualiza) |
| Ver Trechos (mapa + clima) | ✅ todos | ✅ todos | ✅ só trechos da própria equipe |
| Dashboard | ✅ completo | ✅ completo | ✅ reduzido (só a própria equipe, sem gráfico de tendência) |
| Config → Perfil / Preferências / Notificações | ✅ | ✅ | ✅ (iguais pra todo mundo, não têm regra de papel) |
| Config → Gestão de Usuários | ✅ | ✅ | ❌ |
| Config → Parâmetros do Sistema | ✅ | ❌ | ❌ |
| Sincronizar sensores IoT (botão "Atualizar" no Kanban) | ✅ | ✅ | ❌ |
| Sidebar — item "Equipes" | ✅ visível | ✅ visível | ❌ oculto |
| Sidebar — "Planejamento" / "Relatórios" | ✅ visível (sem tela própria ainda) | ✅ visível | ❌ oculto |

---

## Detalhando cada recurso

### Equipes

**Admin e Gestor** enxergam e gerenciam (criar, editar, excluir, ativar/desativar)
todas as equipes do sistema pela tela **Equipes**.

**Operador de Campo não tem acesso a essa tela** — o item some da sidebar pra
esse papel. A razão é conceitual: um Operador de Campo é *membro* de uma
equipe, ele não gerencia equipes. Quem o atribui a uma equipe é Admin/Gestor,
de dois jeitos possíveis (os dois sincronizam o mesmo dado):
- Em **Configurações → Gestão de Usuários**, escolhendo uma ou mais equipes
  numa lista de chips (um operador pode estar em mais de uma equipe ao mesmo
  tempo — ver seção "Escopo por equipe" abaixo).
- Direto na tela **Equipes**, no campo "Responsável" do modal de criar/editar
  equipe — lá também dá pra escolher um Operador de Campo cadastrado (ou
  digitar um nome livre, se o responsável não for um usuário do sistema).

`getEquipesVisiveis()` / `podeVerEquipe()` / `podeGerenciarEquipes()` em `permissions.ts`.

### Kanban

**Admin e Gestor** veem todos os trechos, em todas as colunas de severidade, e
podem criar, excluir, arrastar/mover qualquer card entre colunas.

**Operador de Campo** só vê os cards cujo trecho pertence a uma das equipes
dele (`equipeIds`). Ele consegue arrastar/mover esses cards normalmente (isso
é permitido implicitamente — como ele só enxerga os próprios trechos, mover
um card que ele vê já está dentro do escopo dele). Ele **não** vê o botão de
criar/excluir card, nem o menu "..." de coluna.

`getKanbanItemsVisiveis()` / `podeVerKanbanItem()` / `podeCriarOuExcluirKanbanItem()`.

> **Nota técnica:** existe também uma função `podeEditarKanbanItem()` em
> `permissions.ts`, pensada pra checar especificamente se alguém pode
> editar/mover um card (não só vê-lo). Hoje ela **não é chamada em nenhuma
> tela** — a proteção efetiva na prática vem só da visibilidade
> (`getKanbanItemsVisiveis`): um Operador de Campo não consegue mover um card
> que ele nem enxerga. Se um dia a regra de "ver" e "editar" precisar
> divergir (ex: Operador vê um trecho mas não pode editá-lo), é essa função
> que precisa ser conectada a uma checagem real na tela.

### Ocorrências

**Admin e Gestor** veem, criam, editam e excluem qualquer ocorrência.

**Operador de Campo** só vê ocorrências vinculadas a um trecho de uma das
próprias equipes — e só **visualiza**, não cria/edita/exclui (isso é
exclusivo de Admin/Gestor, mesmo pra ocorrências da própria equipe do
Operador). Como `Ocorrencia` não guarda `equipeId` diretamente (só
`kanbanItemId`), o escopo é resolvido através do trecho vinculado: se o
trecho pertence a uma equipe do Operador, a ocorrência aparece.

`getOcorrenciasVisiveis()` / `podeVerOcorrencia()` / `podeCriarOuExcluirOcorrencia()`.

### Trechos (mapa + clima)

Mesma regra de visibilidade do Kanban — **Operador de Campo** só vê os
trechos das próprias equipes no mapa e na lista lateral (clima em tempo real
inclusive só é buscado pros trechos visíveis a ele).

`getKanbanItemsVisiveis()` (reaproveitada — mesma fonte de verdade do Kanban).

### Dashboard

Todo mundo acessa o Dashboard — a diferença é o **escopo dos dados**:

- **Admin/Gestor:** visão completa (todas as equipes/trechos, ranking de
  priorização geral, gráfico de tendência histórica).
- **Operador de Campo:** visão reduzida — só KPIs e ranking da(s) própria(s)
  equipe(s), **sem** o gráfico de tendência (o histórico salvo é agregado da
  malha inteira, não por equipe, então não dá pra recortar de forma confiável
  só pro escopo do Operador).

`podeAcessarDashboard()` (sempre `true`) / `podeVerDashboardCompleto()`.

### Configurações

A tela de Configurações é dividida em seções, e cada uma tem sua própria regra:

| Seção | Quem vê |
|---|---|
| Perfil (nome, e-mail, senha, foto) | Todo mundo |
| Preferências (tema, idioma, modo compacto) | Todo mundo |
| Notificações (2 toggles reais) | Todo mundo |
| Integrações | Todo mundo (visualização — os "cards" de integração são majoritariamente decorativos hoje, ver README) |
| Dados do Sistema | Todo mundo |
| **Gestão de Usuários** | Admin e Gestor |
| **Parâmetros do Sistema** (pesos de criticidade, frequência de reavaliação) | **Só Admin** |

`podeGerenciarUsuarios()` / `podeAcessarParametrosSistema()`.

### Sincronização de sensores IoT

O botão **"Atualizar"** no Kanban (que busca leituras de sensores e recalcula
altura/severidade dos trechos — ver [`docs/integracao-api-sensores.md`](integracao-api-sensores.md))
só aparece pra quem pode gerenciar o Kanban — ou seja, **Admin e Gestor**. Um
Operador de Campo não sincroniza sensores, mesma regra de quem pode
criar/excluir card.

Reaproveita `podeCriarOuExcluirKanbanItem()` — não existe uma função de
permissão dedicada só pra isso, de propósito, pra não duplicar uma regra que
já existe.

---

## Escopo por equipe do Operador de Campo

Um Operador de Campo pode pertencer a **mais de uma equipe ao mesmo tempo** —
`Usuario.equipeIds` é uma lista (`string[]`), não um valor único. Tudo que é
filtrado por "equipe do usuário" (Kanban, Ocorrências, Trechos, Dashboard)
considera a **união** de todas as equipes dele: se ele está nas equipes A e
B, ele vê os trechos de A e de B juntos.

Atribuir uma equipe nova a um Operador **soma** à lista existente — não
substitui. Ver [`README.md`](../README.md#controle-de-acesso-por-papel-rbac)
pra mais contexto sobre esse desenho.

---

## Onde isso vive no código

| Arquivo | O que tem |
|---|---|
| `src/utils/permissions.ts` | **Fonte única de verdade.** Toda função de permissão citada acima. |
| `src/types/index.ts` | `PapelUsuario = 'admin' \| 'gestor' \| 'operador_campo'`, `Usuario.equipeIds`. |
| `src/data/mockData.ts` | Contas de teste (`mockUsuarios`) — ver tabela de login abaixo. |
| `docs/rls-supabase.md` | Como cada uma dessas funções se traduziria em uma policy de Row Level Security real, quando o backend existir (referência, não executável ainda). |

Cada tela (`EquipesScreen.tsx`, `KanbanScreen.tsx`, `OcorrenciasScreen.tsx`,
`TrechosScreen.tsx`, `DashboardScreen.tsx`, `ConfiguracoesScreen.tsx`) importa
as funções de `permissions.ts` que precisa e usa o resultado pra decidir o
que renderizar — nunca decide sozinha com base no `papel` bruto.

---

## Como testar cada papel

Contas mock já cadastradas (senha `123456` pra todas):

| Login | Papel | Escopo |
|---|---|---|
| `admin` | Admin | Tudo, incluindo Parâmetros do Sistema |
| `joao` | Gestor | Tudo, exceto Parâmetros do Sistema |
| `maria` | Operador de Campo | Só a Equipe Alfa (`#01`) |
| `carlos` | Operador de Campo | Só a Equipe Beta (`#02`) |

Pra testar um Operador em mais de uma equipe, logue como `admin` ou `joao`,
vá em **Configurações → Gestão de Usuários**, edite a Maria ou o Carlos, e
adicione mais uma equipe na lista de chips.
