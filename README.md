# Lobby - Sistema de Gestão de Condomínios

<p align="center">
  <img src="https://img.shields.io/badge/STATUS-PRODUCTION-28a745?style=for-the-badge" />
  <img src="https://img.shields.io/badge/REACT-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TYPESCRIPT-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/TAILWIND-3.4-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white" />
</p>

## Sobre o Projeto

O **Lobby** é um sistema completo de gestão de condomínios, desenvolvido para otimizar a logística de entregas e a administração de moradores, porteiros e síndicos. O sistema oferece uma interface moderna, responsiva e intuitiva para todas as operações do dia a dia de um condomínio.

## Funcionalidades

### Autenticação
- Login seguro com usuário/email e senha
- Sistema de recuperação de senha via email
- Proteção contra tentativas de acesso indevido (bloqueio após 5 tentativas)
- Logout com invalidação de token

### Perfis de Usuário

#### Morador (Resident)
- Visualização de entregas pendentes e entregues
- Acompanhamento do status de cada entrega
- Histórico completo de encomendas

#### Porteiro (Doorman)
- Registro de novas entregas
- Busca de entregas por código de rastreio
- Confirmação de entregas ao morador
- Visualização de entregas pendentes e entregues

#### Síndico (Syndic)
- Gestão completa de contas do condomínio
- Aprovação de novos cadastros
- Alteração de funções de usuários
- Sistema de banimento temporário
- Exclusão de contas

## Tecnologias Utilizadas

| Tecnologia | Descrição |
|------------|-----------|
| **React 18** | Biblioteca para construção de interfaces |
| **TypeScript** | Tipagem estática para maior segurança |
| **Vite** | Build tool de alta performance |
| **Tailwind CSS** | Framework CSS utilitário |
| **React Router** | Gerenciamento de rotas |
| **React Query** | Gerenciamento de estado server-side |
| **Framer Motion** | Animações fluidas |
| **Shadcn/UI** | Componentes de interface |
| **Sonner** | Notificações toast |

## Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base (Button, Card, Input, etc.)
│   ├── AuthCard.tsx    # Card de autenticação
│   ├── Header.tsx      # Cabeçalho da landing page
│   ├── Footer.tsx      # Rodapé
│   └── ...
├── contexts/           # Contextos React
│   └── AuthContext.tsx # Gerenciamento de autenticação
├── hooks/              # Hooks customizados
├── lib/                # Utilitários e API
│   ├── api.ts          # Funções de integração com backend
│   ├── utils.ts        # Funções auxiliares
│   └── formatters.ts   # Formatadores de dados
├── pages/              # Páginas da aplicação
│   ├── dashboards/     # Dashboards por perfil
│   │   ├── ResidentDashboard.tsx
│   │   ├── DoormanDashboard.tsx
│   │   └── SyndicDashboard.tsx
│   ├── Index.tsx       # Landing page
│   ├── Login.tsx       # Página de login
│   ├── Register.tsx    # Seleção de perfil
│   ├── RegisterForm.tsx # Formulário de cadastro
│   ├── Dashboard.tsx   # Roteador de dashboards
│   └── ...
└── main.tsx            # Entrada da aplicação
```

## Instalação

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn

### Passos

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/lobby.git
cd lobby
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

4. Acesse no navegador:
```
http://localhost:8080
```

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Gera build de produção |
| `npm run preview` | Visualiza build de produção |
| `npm run lint` | Executa verificação de código |

## API Backend

O sistema está integrado com a API hospedada em:
```
https://lobby-api-production.up.railway.app
```

### Endpoints Principais

#### Autenticação
- `POST /api/auth/sign-up` - Cadastro de usuário
- `POST /api/auth/sign-in` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Dados do usuário logado
- `POST /api/auth/forgot-password` - Recuperação de senha
- `POST /api/auth/reset-password` - Reset de senha

#### Entregas
- `GET /api/deliveries` - Listar entregas
- `POST /api/doorman/deliveries` - Registrar entrega
- `GET /api/doorman/deliveries/{code}` - Buscar por código
- `PUT /api/doorman/deliveries/{code}/confirm` - Confirmar entrega

#### Gestão de Contas (Síndico)
- `GET /api/syndic/accounts` - Listar contas
- `GET /api/syndic/accounts/pendant` - Contas pendentes
- `PATCH /api/syndic/accounts/approve/{id}` - Aprovar conta
- `DELETE /api/syndic/accounts/{id}` - Deletar conta
- `PATCH /api/syndic/accounts/role` - Alterar função
- `PATCH /api/syndic/accounts/ban` - Banir conta
- `PATCH /api/syndic/accounts/unban/{id}` - Desbanir conta
- `GET /api/syndic/accounts/bans` - Listar banidos

## Fluxo de Cadastro

1. Usuário seleciona seu perfil (Morador, Porteiro ou Síndico)
2. Preenche os dados obrigatórios:
   - CPF, Nome completo, Username, Email, Telefone, Senha
   - Código do condomínio (obrigatório para todos)
   - Bloco e Apartamento (obrigatório para Morador e Síndico)
3. Após o cadastro, a conta fica pendente de aprovação pelo síndico

## Segurança

- Autenticação via JWT Token
- Tokens armazenados de forma segura no localStorage
- Invalidação de tokens no logout
- Rotas protegidas com verificação de autenticação
- Redirecionamento automático para login quando não autenticado

## Build de Produção

Para gerar uma build otimizada para produção:

```bash
npm run build
```

Os arquivos serão gerados na pasta `dist/`, prontos para deploy.

## Deploy

O projeto pode ser deployado em qualquer plataforma que suporte aplicações React/Vite:

- Vercel
- Netlify
- Railway
- AWS S3 + CloudFront
- Nginx

## Licença

Este projeto é proprietário e confidencial. Todos os direitos reservados.

---

**Lobby** - Transformando a gestão de condomínios.
