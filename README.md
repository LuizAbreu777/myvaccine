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
| **Usuário** | hatus.luiz@myvaccine.com | hatus123 |

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
## ❓ FAQ - Desenvolvedor/Admin

### O que é o MyVaccine?

O MyVaccine é um sistema para gerenciar vacinas, permitindo registrar históricos, acompanhar doses futuras e controlar a vacinação de usuários e pacientes.

### Quais tecnologias são usadas?

**Backend:** NestJS, TypeORM, JWT

**Frontend:** React, Mantine UI

**Banco de dados:** SQLite

### Posso usar em produção?

Sim, mas é necessário configurar o ambiente e o banco corretamente. Para testes rápidos, o projeto já inclui seed com dados de exemplo.

### Como resetar o banco de dados?
```bash
cd myvaccine-api
rm database.sqlite && npm run seed
```
### Existe usuário de teste?

Sim, as credenciais estão na seção 🔐 Credenciais de Teste.

### Preciso de Node.js específico?

Sim, Node.js 18+ é recomendado para rodar o projeto corretamente.
---
## ❓ FAQ - Usuários

### Como me cadastrar no MyVaccine?

Você pode se cadastrar clicando em “Registrar” na tela de login e preenchendo seus dados pessoais.

### Como registrar minhas vacinas?

Após o login, acesse a seção Vacinas, clique em Adicionar Vacina e preencha as informações da dose recebida.

### Como acompanhar doses futuras?

O sistema envia lembretes automáticos para cada vacina cadastrada, indicando quando a próxima dose deve ser tomada.

### Posso adicionar dependentes?

Sim, na seção Usuários/Dependentes você pode registrar familiares e acompanhar a vacinação deles.

### Posso acessar meu histórico de vacinação?

Sim, o histórico completo de todas as vacinas cadastradas fica disponível na seção Histórico de Vacinação.

### O que faço se esquecer minha senha?

Use a opção “Esqueci minha senha” na tela de login para redefini-la por email.

## 📄 Licença

Projeto privado e de uso restrito.
