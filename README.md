# Motiva — Aplicativo de Gestão de Rodovias

Aplicativo cross-platform desenvolvido com **Expo + React Native + TypeScript** para a gestão operacional de equipes e ocorrências em malhas rodoviárias federais e estaduais sob concessão.

---

## Como rodar o projeto

### Pré-requisitos

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Expo Go instalado no celular **ou** navegador web

### Instalação

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd SPRINT02-CROSS-PLATAFORM-APPLICATION-DEVELOPMENT

# Instale as dependências
npm install
```

### Executando

```bash
# Web (recomendado para desenvolvimento)
npx expo start --web

# Dispositivo físico via Expo Go
npx expo start
# Escaneie o QR code com o Expo Go (Android) ou a câmera (iOS)
```

### Credenciais de acesso (dados mockados)

| Usuário | Senha    | Cargo         |
|---------|----------|---------------|
| `admin` | `123456` | Administrador |


---

## O que o app faz

O **Motiva** é um sistema de controle operacional rodoviário com quatro fluxos principais:

### 1. Autenticação
Tela de login com validação de credenciais contra dados mockados, toggle de visibilidade de senha e feedback de erro em tempo real.

### 2. Gerenciamento de Equipes
Tabela paginada (7 itens/página) com:
- Busca por nome, responsável ou ID
- Filtros por rodovia (BR-116, BR-381, SP-280) e status
- CRUD completo: criar, editar, excluir e alternar status (Ativo → Em Campo → Inativo)
- Painel de notificações global acessível pelo sino no header

### 3. Kanban de Vegetação
Quadro Kanban com quatro colunas baseadas na severidade da vegetação:

| Coluna         | Faixa de altura |
|----------------|-----------------|
| Sem Ocorrência | 0 – 4 cm        |
| Leve           | 5 – 14 cm       |
| Grave          | 15 – 24 cm      |
| Crítico        | ≥ 25 cm         |

Funcionalidades:
- Arrastar e soltar cards entre colunas com validação automática de faixa de altura
- Modal de criação rápida com nome pré-preenchido ao usar o botão "+"
- CRUD completo de registros de vegetação
- Cada ação (criar, editar, mover, excluir) gera uma notificação em tempo real

### 4. Ocorrências
Fluxo completo em três telas:
- **Lista**: resumo estatístico (total, abertas, em andamento, resolvidas), filtros por risco e status, lista de cards
- **Cadastro**: modal com campos de título, local, categoria, responsável, descrição e seleção de nível de risco
- **Detalhe**: exibe todos os dados da ocorrência com botão para avançar o status (Aberta → Em Andamento → Resolvida)

---

## Notificações globais

O app possui um sistema de notificações compartilhado entre todas as telas, implementado via **React Context**:

- O sino no header de qualquer tela abre um painel flutuante com as últimas notificações (scrollável)
- "Ver todas" abre um modal com o histórico completo e opção de limpar
- Ações no Kanban (mover card, criar, editar, excluir) geram notificações automaticamente
- O contador de notificações não lidas aparece como badge vermelho no sino

```typescript
// Gerar uma notificação de qualquer tela:
const { adicionarNotificacao } = useNotificacoes();

adicionarNotificacao({
  cor: '#8B5CF6',
  icone: 'albums-outline',
  titulo: 'Card movido no Kanban',
  desc: '"Equipe Alfa" foi movido para a coluna Grave (18 cm).',
});
```

---

## Estrutura do projeto

```
src/
├── screens/
│   ├── LoginScreen.tsx          # Autenticação
│   ├── EquipesScreen.tsx        # Gerenciamento de equipes
│   ├── KanbanScreen.tsx         # Kanban de vegetação
│   ├── OcorrenciasScreen.tsx    # Lista + Cadastro de ocorrências
│   └── DetalheScreen.tsx        # Detalhe e avanço de status de ocorrência
│
├── components/
│   ├── NotificacoesBell.tsx     # Sino + painel flutuante + modal de notificações
│   └── OcorrenciaCard.tsx       # Card reutilizável de ocorrência
│
├── context/
│   └── NotificacoesContext.tsx  # Estado global de notificações (React Context)
│
├── types/
│   └── index.ts                 # Tipagem TypeScript centralizada
│
├── data/
│   └── mockData.ts              # Dados mockados (sem API externa)
│
├── navigation/
│   └── AppNavigator.tsx         # React Navigation (Stack)
│
└── theme/
    └── index.ts                 # Cores e tokens de design
```

---

## Modelagem TypeScript

Todos os tipos estão centralizados em `src/types/index.ts`:

```typescript
export type RiscoNivel = 'baixo' | 'medio' | 'alto';

export type Ocorrencia = {
  id: number;
  titulo: string;
  descricao: string;
  local: string;
  risco: RiscoNivel;
  data: string;
  categoria: string;
  status: 'aberta' | 'em_andamento' | 'resolvida';
  responsavel: string;
};

export type StatusEquipe = 'ativo' | 'inativo' | 'em_campo';

export type SeveridadeVegetacao = 'sem_ocorrencia' | 'leve' | 'grave' | 'critico';

export type KanbanItem = {
  id: string;
  equipeId: string;
  nomeEquipe: string;
  rodovia: string;
  kmInicio: number;
  kmFim: number;
  tipoVegetacao: string;
  alturaAtual: number;
  severidade: SeveridadeVegetacao;
  responsavel: string;
  observacao: string;
  ultimoServico: { data: string; responsavel: string } | null;
};

export type Notificacao = {
  id: number;
  cor: string;
  icone: string;
  titulo: string;
  desc: string;
  criadaEm: Date;
};
```

---

## Como os dados estão mockados

Todos os dados ficam em `src/data/mockData.ts` e são carregados via `useState` em cada tela. Não há chamadas a APIs externas — o app funciona 100% offline.

### Usuários (`mockUsuarios`)
2 usuários de teste com credenciais fixas para validação no login.

### Ocorrências (`mockOcorrencias`)
5 ocorrências pré-cadastradas cobrindo cenários reais da Motiva:
- Vazamento de óleo na pista
- Falta de EPI em equipe de campo
- Iluminação deficiente em túnel
- Manutenção de guardrail pendente
- Sinalização apagada em trecho crítico

Cada ocorrência tem `risco` (`baixo` / `medio` / `alto`) e `status` (`aberta` / `em_andamento` / `resolvida`).

### Equipes (`mockEquipes`)
10 equipes distribuídas nas rodovias BR-116, BR-381 e SP-280 com responsáveis, trechos e status variados.

### Kanban (`mockKanban`)
10 registros de vegetação com alturas entre 3 cm e 35 cm. A severidade é calculada automaticamente:

```typescript
function calcSeveridade(cm: number): SeveridadeVegetacao {
  if (cm <= 4)  return 'sem_ocorrencia';
  if (cm <= 14) return 'leve';
  if (cm <= 24) return 'grave';
  return 'critico';
}
```

---

## Navegação

Utiliza **React Navigation** (`@react-navigation/native-stack`) com rota inicial no Login:

```
Login
  └── Equipes
        ├── Kanban
        └── Ocorrencias
              └── Detalhe
```

---

## Gerenciamento de estado

O app usa `useState` e **React Context** para gestão de dados dinâmicos.

### Estado local (por tela)

```typescript
// OcorrenciasScreen
const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>(mockOcorrencias);

// KanbanScreen
const [itens, setItens] = useState<KanbanItem[]>(mockKanban);

// EquipesScreen
const [equipes, setEquipes] = useState<Equipe[]>(mockEquipes);
```

### Estado global (React Context)

```typescript
// NotificacoesContext — disponível em todas as telas via hook
const { notificacoes, adicionarNotificacao, limparTodas } = useNotificacoes();
```

O `NotificacoesProvider` envolve toda a aplicação em `App.tsx`, garantindo que notificações geradas no Kanban apareçam instantaneamente no sino de qualquer outra tela.

Todas as operações de criar, editar e excluir atualizam o estado local e refletem imediatamente na interface.

---

## Tecnologias utilizadas

| Tecnologia        | Versão | Uso                                    |
|-------------------|--------|----------------------------------------|
| Expo SDK          | 56     | Plataforma base                        |
| React Native      | 0.79   | Framework UI                           |
| TypeScript        | 5.x    | Tipagem estática                       |
| React Navigation  | 7.x    | Navegação entre telas (Stack)          |
| React Context API | —      | Estado global de notificações          |
| Expo Vector Icons | —      | Ícones (Ionicons, MaterialIcons)       |
| React Native Web  | —      | Suporte a navegador                    |
