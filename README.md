# 💉 MyVaccine

Sistema de gestão de vacinação | **NestJS + React + SQLite**

---

## ⚡ Instalação Rápida (Modo Monorepo)

**Requisito:** Node.js 18+

```bash
# na raiz do projeto
npm install
npm run install:all
npm run dev
```

* API (NestJS) roda em `http://localhost:3000`
* Frontend (React) roda em `http://localhost:3005`

👉 Um único comando sobe **backend + frontend juntos**.

---

## 🔧 Scripts Principais (Raiz do Projeto)

| Comando               | Descrição                              |
| --------------------- | -------------------------------------- |
| `npm run install:all` | Instala dependências da API e do Front |
| `npm run dev`         | Sobe API (watch) + Front juntos        |
| `npm run build`       | Build completo (API + Front)           |
| `npm run test`        | Executa testes da API e do Front       |
| `npm run seed`        | Popula o banco (API)                   |

---

## 🔧 Scripts por Projeto

### Backend (`myvaccine-api`)

| Comando             | Descrição               |
| ------------------- | ----------------------- |
| `npm run start:dev` | Desenvolvimento (watch) |
| `npm run start`     | Execução normal         |
| `npm run build`     | Build produção          |
| `npm run seed`      | Popular banco           |

### Frontend (`myvaccine-frontend`)

| Comando         | Descrição       |
| --------------- | --------------- |
| `npm start`     | Desenvolvimento |
| `npm run build` | Build produção  |

---

## 🔐 Credenciais de Teste

| Tipo        | Email                                                             | Senha    |
| ----------- | ----------------------------------------------------------------- | -------- |
| **Admin**   | [admin@myvaccine.com](mailto:admin@myvaccine.com)                 | admin123 |
| **Usuário** | [luiz.fernando@myvaccine.com](mailto:luiz.fernando@myvaccine.com) | luiz123  |
| **Usuário** | [hatus.luiz@myvaccine.com](mailto:hatus.luiz@myvaccine.com)       | hatus123 |

---

## 📁 Estrutura do Projeto

```
myvaccine/
├── myvaccine-api/       # Backend (NestJS, TypeORM, JWT)
│   └── src/
│       ├── auth/        # Autenticação
│       ├── users/       # Usuários e dependentes
│       ├── vaccines/    # Vacinas
│       ├── posts/       # Postos de vacinação
│       ├── stocks/      # Estoque
│       └── vaccination-history/
│
└── myvaccine-frontend/  # Frontend (React, Mantine UI)
    └── src/
        ├── pages/       # Páginas da aplicação
        ├── components/  # Componentes reutilizáveis
        └── services/    # Chamadas à API
```

---

## 🔄 Resetar Banco de Dados

```bash
cd myvaccine-api
rm database.sqlite && npm run seed
```

---

## ❓ FAQ - Desenvolvedor / Admin

### O que é o MyVaccine?

Sistema para gerenciar vacinas, históricos de doses, dependentes e controle de vacinação.

### Posso rodar tudo com um comando?

Sim. Use:

```bash
npm run dev
```

### Preciso rodar comandos separados?

Não. O `package.json` da raiz orquestra tudo automaticamente.

### Preciso de Node.js específico?

Sim, **Node.js 18+**.

---

## ❓ FAQ - Usuários

### Como me cadastrar?

Use a opção **Registrar** na tela de login.

### Posso acompanhar doses futuras?

Sim, o sistema gerencia lembretes e histórico de vacinação.

---

## 📄 Licença

Projeto privado e de uso restrito.
