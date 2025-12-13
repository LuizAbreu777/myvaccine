# 💉 MyVaccine

Sistema de gestão de vacinação | **NestJS + React + SQLite**

## ⚡ Instalação Rápida

**Requisito:** Node.js 18+

```bash
# Backend (Terminal 1)
cd myvaccine-api
cp env.example .env
npm install
npm run start:dev

# Seed - popular banco (Terminal 2)
cd myvaccine-api
npm run seed

# Frontend (Terminal 3)
cd myvaccine-frontend
cp env.example .env
npm install
npm start
```

**Acessar:** http://localhost:3005

---

## 🔐 Credenciais de Teste

| Tipo | Email | Senha |
|------|-------|-------|
| **Admin** | admin@myvaccine.com | admin123 |
| **Usuário** | luiz.fernando@myvaccine.com | luiz123 |

---

## 📁 Estrutura

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

## 🔧 Scripts

### Backend (`myvaccine-api`)
| Comando | Descrição |
|---------|-----------|
| `npm run start:dev` | Desenvolvimento |
| `npm run seed` | Popular banco |
| `npm run build` | Build produção |

### Frontend (`myvaccine-frontend`)
| Comando | Descrição |
|---------|-----------|
| `npm start` | Desenvolvimento |
| `npm run build` | Build produção |

---

## 🔄 Resetar Banco

```bash
cd myvaccine-api
rm database.sqlite && npm run seed
```

---

## 📄 Licença

Projeto privado e de uso restrito.
