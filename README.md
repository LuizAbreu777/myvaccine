## MyVaccine

Sistema de gestão de vacinação com backend em NestJS e frontend em React.

### Tecnologias

- **Backend (myvaccine-api)**: NestJS 11, TypeORM, SQLite, Passport/JWT, Class-Validator, Class-Transformer, RxJS, bcryptjs
- **Frontend (myvaccine-frontend)**: React 19, React Router 7, Mantine UI 8, Axios, TypeScript, CRA (react-scripts)

### Estrutura do projeto

- `myvaccine-api`: API REST em NestJS
- `myvaccine-frontend`: SPA em React

### Pré-requisitos

- Node.js 18+ e npm

---

## Backend — myvaccine-api

### Variáveis de ambiente

Copie `myvaccine-api/env.example` para `myvaccine-api/.env` e ajuste se necessário:

```
JWT_SECRET=myvaccine-super-secret-key-2025
DATABASE_PATH=database.sqlite
PORT=3001
NODE_ENV=development
```

Valores padrão (se não definidos):
- `JWT_SECRET`: myvaccine-super-secret-key-2025
- `DATABASE_PATH`: database.sqlite (arquivo criado na raiz de `myvaccine-api`)
- `PORT`: 3001

### Instalação

```bash
cd myvaccine-api
npm install
```

### Scripts principais

```bash
# desenvolvimento com watch
npm run start:dev

# build de produção
npm run build

# start em produção (usa dist/)
npm run start:prod

# executar seed do banco (usuários, vacinas, postos, estoque, histórico)
npm run seed
```

O seed cria usuários e dados iniciais. Credenciais de teste geradas:
- Admin: `admin@myvaccine.com` / `admin123`
- Usuário: `user@myvaccine.com` / `user123`

### Endpoints e porta

- A API sobe por padrão em `http://localhost:3001`.
- JWT está habilitado (veja `login` na API e use o token nos endpoints protegidos).

---

## Frontend — myvaccine-frontend

### Variáveis de ambiente

Copie `myvaccine-frontend/env.example` para `myvaccine-frontend/.env` e ajuste a URL da API se necessário:

```
PORT=3005
REACT_APP_API_URL=http://localhost:3001
```

### Instalação

```bash
cd myvaccine-frontend
npm install
```

### Scripts principais

```bash
# desenvolvimento (CRA)
npm start

# build de produção
npm run build

# testes (CRA)
npm test
```

O app roda por padrão em `http://localhost:3005` e consome a API de `REACT_APP_API_URL`.

---

## Como executar o projeto completo (dev)

1. Backend
   ```bash
   cd myvaccine-api
   cp env.example .env
   npm install
   npm run start:dev
   ```

2. Seed do banco (opcional mas recomendado na primeira execução)
   ```bash
   # Em outro terminal, ainda em myvaccine-api
   npm run seed
   ```

3. Frontend
   ```bash
   cd myvaccine-frontend
   cp env.example .env
   npm install
   npm start
   ```

4. Acesse o frontend em `http://localhost:3005` e autentique com as credenciais de teste.

---

## Comandos úteis

### Backend
- **Lint**: `npm run lint`
- **Testes**: `npm test`, `npm run test:watch`, `npm run test:cov`

### Frontend
- **Build**: `npm run build`
- **Tests**: `npm test`

---

## Notas

- Banco SQLite é um arquivo local definido por `DATABASE_PATH`. Para resetar, pare a API e remova o arquivo (ex.: `rm myvaccine-api/database.sqlite`), depois rode `npm run seed` novamente.
- Se alterar a porta da API, atualize `REACT_APP_API_URL` no frontend.


