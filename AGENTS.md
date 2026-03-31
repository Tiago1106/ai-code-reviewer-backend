# AI Code Reviewer (Backend)

## Workflow de Desenvolvimento

### Regras gerais
- Trabalhar **por feature** — um commit atômico por feature/fix/tarefa
- **Commit somente quando o usuário pedir** — nunca commitar automaticamente
- **Antes de cada commit**: atualizar o `CHANGELOG.md` com as mudanças da feature
- **Push logo após o commit** — sempre dar push depois de commitar
- **Nunca iniciar a próxima feature** sem o usuário pedir explicitamente

### Convenção de commits
| Prefixo | Quando usar |
|---------|-------------|
| `feat(scope)` | Nova funcionalidade (módulo, endpoint, componente) |
| `fix(scope)` | Correção de bug |
| `hotfix(scope)` | Correção urgente em produção |
| `chore(scope)` | Config, scaffolding, dependências, CI |
| `test(scope)` | Testes novos ou ajustes em testes existentes |
| `docs(scope)` | Documentação |
| `refactor(scope)` | Reestruturação sem mudar comportamento |
| `style(scope)` | Formatação, lint (sem mudar lógica) |

### Formato do CHANGELOG.md
Seguir o padrão [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

Categorias disponíveis:
- `Added` — funcionalidades novas
- `Changed` — mudanças em funcionalidades existentes
- `Deprecated` — funcionalidades que serão removidas
- `Removed` — funcionalidades removidas
- `Fixed` — correções de bugs
- `Security` — correções de segurança

### Checklist pré-commit
1. Código da feature está pronto e testado
2. `CHANGELOG.md` atualizado com as mudanças
3. Aguardar aprovação do usuário para commitar
4. Após commit, fazer push imediatamente

---

## Objetivo
Fornecer uma API HTTP que recebe um trecho de código (mais linguagem e contexto) e retorna um code review estruturado.

O MVP é propositalmente minimalista para validar o fluxo ponta a ponta com o frontend:
- Sem autenticação
- Sem banco de dados
- Sem integração com Ollama
- A API retorna um resultado fixo (mock), guardado em memória por `id` com TTL

Depois do MVP: integração com Ollama, persistência no Postgres, GitHub OAuth, histórico e review de PR.

## Tecnologias (alvo)
- Node.js + TypeScript
- NestJS 11
- Arquitetura por feature (ex: `reviews/`, `auth/`, `github/` futuramente)
- class-validator / class-transformer para validação de DTO
- @nestjs/config para ler `.env`
- Swagger (OpenAPI) para documentação da API

## Compatibilidade
- Node.js: usar a versão instalada no ambiente (evitar APIs experimentais)
- Gerenciador: npm

## Estrutura de pastas (planejada)
- `src/main.ts`
- `src/app.module.ts`
- `src/reviews/`
- `src/reviews/reviews.module.ts`
- `src/reviews/reviews.controller.ts`
- `src/reviews/reviews.service.ts`
- `src/reviews/dto/`
- `src/reviews/types/`

## Como rodar (MVP)
- Porta: `3001`
- Origin do frontend liberado via CORS: `WEB_ORIGIN` (padrão `http://localhost:3000`)

Comandos (npm):
- `npm install`
- `npm run start:dev`

## Documentação (Swagger)
Objetivo:
- Ter documentação navegável da API desde o MVP.

Plano:
- Configurar Swagger no `main.ts` (Nest)
- Endpoint da UI: `GET /docs`
- (Opcional) JSON do schema: `GET /docs-json`

Notas:
- Não expor o Swagger em produção sem autenticação (pós-MVP)

Implementação:
- Usar `@ApiTags('reviews')` no controller
- Usar `@ApiProperty()` nos DTOs para documentar campos
- Usar `@ApiResponse()` para documentar status codes
- Usar `@ApiOperation()` para descrever cada endpoint

## Variáveis de ambiente (MVP)
- `PORT=3001`
- `WEB_ORIGIN=http://localhost:3000`
- `REVIEW_TTL_MS=900000` (15 minutos)
- `REVIEW_CLEANUP_INTERVAL_MS=60000` (1 minuto)

Defaults recomendados:
- Se `REVIEW_TTL_MS` não vier, usar `900000`
- Se `REVIEW_CLEANUP_INTERVAL_MS` não vier, usar `60000`

## Arquivo .env (MVP)
- Criar `.env` local com as variáveis acima
- Manter um `.env.example` no repositório (sem segredos) para facilitar setup

## Formato dos arquivos
- UTF-8

## CORS (MVP)
- Permitir apenas `WEB_ORIGIN`
- Métodos: `GET`, `POST`
- Headers: `Content-Type`
- Sem `credentials` no MVP (quando entrar auth por cookie, reavaliar)

## Contrato da API (MVP)

### POST /reviews
Request JSON:
```json
{
  "language": "javascript",
  "code": "...",
  "context": "..."
}
```

Response JSON:
```json
{ "id": "<uuid>" }
```

Comportamento:
- Valida DTO (language enum, `code` não vazio, `context` opcional)
- Gera `id` (UUID)
- Guarda um `ReviewResult` mock em memória (Map) respeitando TTL
- Retorna `{ id }`

### GET /reviews/:id
Response JSON (200):
```json
{
  "id": "<uuid>",
  "status": "done",
  "result": {
    "summary": "...",
    "positives": [],
    "issues": [],
    "suggestions": [],
    "questions": [],
    "overallScore": 7
  }
}
```

Erros:
- `404` se não existir ou estiver expirado

### GET /health
Response JSON (200):
```json
{ "status": "ok" }
```

Uso: verificar se a API está rodando. Sem lógica de negócio.

## Padrão de erros (MVP)
- Validação de DTO: `400` (Nest ValidationPipe)
- Review não encontrada/expirada: `404`
- Erros inesperados: `500`

Observação:
- No MVP, não padronizar envelope de erro além do padrão do Nest. Podemos padronizar depois.

Formato padrão de erro do NestJS (para referência do frontend):
```json
{
  "statusCode": 400,
  "message": ["language must be one of: javascript, typescript, python, go, java"],
  "error": "Bad Request"
}
```

Para 404:
```json
{
  "statusCode": 404,
  "message": "Review not found",
  "error": "Not Found"
}
```

## Schema do resultado (estável)
`ReviewResult` precisa manter este formato ao longo do projeto (MVP e novas features), para o frontend continuar compatível:
- `summary: string`
- `positives: { title: string; explanation: string }[]`
- `issues: {
  severity: "low"|"medium"|"high"|"critical";
  category: "quality"|"security"|"performance";
  title: string;
  explanation: string;
  recommendation: string;
  diff?: string;
}[]`
- `suggestions: string[]`
- `questions: string[]`
- `overallScore: number` (0-10)

## Design interno (MVP)
- `ReviewsModule` com `ReviewsController` e `ReviewsService`
- `ReviewsService` mantém um `Map<string, ReviewRecord>`:
  - `createdAt`, `expiresAt`, `result`
- Limpeza por TTL via `setInterval` usando `REVIEW_CLEANUP_INTERVAL_MS`
- Em memória: se reiniciar a API, perde os dados (ok no MVP)

Pontos de atenção:
- O Map em memória não escala horizontalmente (ok no MVP)
- Definir um limite de tamanho de payload (ex: max 200KB de código) quando integrar IA
- Implementar `OnModuleDestroy` no `ReviewsService` para limpar o `setInterval` quando o módulo for destruído (evita leak em testes e hot reload)

## Mock fixture (MVP)
O `ReviewsService` retorna sempre este resultado fixo (independente do input):

```json
{
  "summary": "O código está funcional, mas pode melhorar em legibilidade e boas práticas.",
  "positives": [
    {
      "title": "Código funcional",
      "explanation": "O trecho executa sem erros e cumpre o objetivo básico."
    },
    {
      "title": "Simplicidade",
      "explanation": "A lógica é direta e fácil de acompanhar."
    }
  ],
  "issues": [
    {
      "severity": "medium",
      "category": "quality",
      "title": "Falta de tipagem explícita",
      "explanation": "Variáveis sem tipo explícito dificultam manutenção em projetos maiores.",
      "recommendation": "Adicione tipos explícitos às variáveis e parâmetros de função.",
      "diff": "- const count = 0;\n+ const count: number = 0;\n- function process(data) {\n+ function process(data: string): void {"
    },
    {
      "severity": "low",
      "category": "quality",
      "title": "Nome de variável pouco descritivo",
      "explanation": "Nomes como 'x' ou 'tmp' não comunicam a intenção do código.",
      "recommendation": "Use nomes descritivos que indiquem o propósito da variável.",
      "diff": "- const x = getData();\n- const tmp = transform(x);\n+ const userData = getData();\n+ const formattedUser = transform(userData);"
    },
    {
      "severity": "high",
      "category": "security",
      "title": "Input não sanitizado",
      "explanation": "Dados de entrada devem ser validados antes de processamento.",
      "recommendation": "Valide e sanitize inputs usando uma biblioteca apropriada.",
      "diff": "- const query = req.body.query;\n- db.execute(query);\n+ const query = sanitize(req.body.query);\n+ db.execute(preparedStatement, [query]);"
    }
  ],
  "suggestions": [
    "Considere adicionar tratamento de erros com try/catch.",
    "Extraia lógica repetida para funções auxiliares.",
    "Adicione comentários para trechos não óbvios."
  ],
  "questions": [
    "Este código será usado em produção ou é um protótipo?",
    "Há testes automatizados cobrindo essa funcionalidade?"
  ],
  "overallScore": 6
}
```

Motivo: ter um mock rico exercita todos os elementos do frontend (severity badges, code examples, lista de positives, etc.).

### Formato do campo `diff`
O campo `diff` nas issues usa formato unified diff simplificado (estilo GitHub PR):
- Linhas com prefixo `-` representam código a ser removido
- Linhas com prefixo `+` representam código a ser adicionado
- Linhas sem prefixo são contexto
- Separar linhas com `\n`
- O campo é opcional: nem toda issue precisa de diff (ex: sugestões genéricas)

Quando integrar com Ollama (pós-MVP), o prompt deve instruir o modelo a gerar diffs nesse formato.

## Segurança de dados (MVP)
- Não logar o código enviado pelo usuário
- Não retornar HTML; apenas JSON
- Limitar tamanho do body em 200KB via NestJS (bodyParser limit) — o suficiente para snippets de código sem permitir abuso

## Teste manual (MVP)
Exemplo:
```bash
curl -X POST http://localhost:3001/reviews \
  -H "Content-Type: application/json" \
  -d "{\"language\":\"typescript\",\"code\":\"const x = 1\"}"
```

## Testes automatizados (MVP)
Estratégia mínima:

Unit tests:
- `ReviewsService`: testar criação, busca, expiração (TTL) e cleanup
- Mockar `Date.now()` para testar TTL sem esperar

E2E tests:
- `POST /reviews`: retorna 201 com `{ id }` para input válido; retorna 400 para input inválido
- `GET /reviews/:id`: retorna 200 com resultado; retorna 404 para ID inexistente
- `GET /health`: retorna 200

Ferramentas:
- Jest (incluso no NestJS)
- Supertest para e2e

Scripts:
- `npm run test` (unit)
- `npm run test:e2e` (e2e)

## Nota sobre i18n
A API pode retornar conteúdo em inglês no mock (ou neutro). A localização (PT-BR/EN) é responsabilidade do frontend.

## Roadmap

### MVP (Agora)
- Resultado mock fixo
- Storage em memória com TTL
- Validação de DTO + CORS

### Nova feature: Integração com Ollama
- Chamar Ollama local (`OLLAMA_BASE_URL=http://localhost:11434`)
- Forçar resposta estruturada em JSON (sem texto extra)
- Validar JSON retornado; 1 retry se vier inválido
- Considerar processamento assíncrono para inputs grandes (`status: processing|done|error`)

### Nova feature: Persistência no Postgres
- Prisma + Postgres
- Persistir reviews e resultados (histórico)
- Trocar o Map em memória por banco

### Nova feature: Boas práticas de segurança
- Rate limiting por IP/usuário
- Limite de tamanho do request body
- Sanitização/normalização básica de entrada (sem tentar "corrigir" código)
- Logs estruturados (sem vazar conteúdo sensível)

## Observabilidade (pós-MVP)
- Logs com request id (correlation)
- Métricas simples (tempo de processamento e taxa de erro)

## Scripts (quando o projeto for criado)
- `npm run start:dev`
- `npm run build`
- `npm run start:prod`
- `npm run lint`
- `npm run test`

### Nova feature: GitHub OAuth + Review de PR
- Login via GitHub OAuth
- Listar repos/PRs
- Buscar diff/patch do PR e reutilizar o pipeline de review
- Chunking + consolidação final para PR grande

### Projeto final
- Auth + perfil/conexões
- Histórico com filtros
- Review de snippet + PR
- Rate limiting, observabilidade básica e configuração para deploy
