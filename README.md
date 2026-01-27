# Nuvora CRM API

![Licença](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-%233178C6.svg?style=flat&logo=typescript&logoColor=white)
![Fastify](https://img.shields.io/badge/fastify-%23000000.svg?style=flat&logo=fastify&logoColor=white)
![PRs](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat)

> API backend para um CRM SaaS multi-tenant, focado em isolamento de dados, controle de acesso baseado em função (RBAC) e arquitetura limpa.

---

### 🚧 **Projeto em Desenvolvimento Ativo** 🚧

Este é um projeto autoral, desenvolvido para simular desafios reais de um produto B2B e para fins de estudo e portfólio. O foco atual é a consolidação do RBAC, isolamento por organização e a implementação dos fluxos de negócio para cada entidade.

---

## 📋 Tabela de Conteúdos

1.  [Sobre o Projeto](#-sobre-o-projeto)
    *   [Recursos Técnicos](#-recursos-técnicos)
    *   [Stack de Tecnologia](#️-stack-de-tecnologia)
2.  [🚀 Começando](#-começando)
    *   [Pré-requisitos](#pré-requisitos)
    *   [Instalação](#instalação)
3.  [📜 Uso e Endpoints da API](#-uso-e-endpoints-da-api)
4.  [🗃️ Esquema do Banco de Dados](#️-esquema-do-banco-de-dados)
5.  [📄 Licença](#-licença)

## ✨ Sobre o Projeto

NuvoraCRM é um backend de CRM poderoso, escalável e fácil de usar, projetado para gerenciar organizações, usuários, clientes, negócios e muito mais. Construído com uma pilha de tecnologia moderna, ele fornece uma base robusta para a construção de uma aplicação de CRM completa.

### ⭐ Recursos Técnicos

*   **Multi-tenancy:** Isolamento total dos dados por organização em todas as queries.
*   **RBAC (Role-Based Access Control):** Validação de permissões (ator vs. alvo) em operações sensíveis.
*   **Fluxo de Convite:** Sistema de convite de usuários com token de ativação por e-mail.
*   **Autenticação:** JWT (JSON Web Tokens) stateless para segurança e escalabilidade.
*   **Arquitetura Limpa:** Separação clara de responsabilidades entre `Controller`, `Service` e `Repository`.
*   **DTOs (Data Transfer Objects):** Objetos semânticos para cada caso de uso, garantindo clareza e segurança na transferência de dados.

### 🛠️ Stack de Tecnologia

*   **Backend:** [Fastify](https://www.fastify.io/)
*   **ORM:** [TypeORM](https://typeorm.io/)
*   **Banco de Dados:** [PostgreSQL](https://www.postgresql.org/)
*   **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
*   **Containerização:** [Docker](https://www.docker.com/)

## 🚀 Começando

Siga estas instruções para ter uma cópia do projeto rodando localmente para desenvolvimento e testes.

### Pré-requisitos

*   [Node.js](https://nodejs.org/) (v18 ou superior)
*   [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)
*   [NPM](https://www.npmjs.com/)

### Instalação

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/EdevandoAlves/api-nuvora-crm.git
    cd api-nuvora-crm
    ```

2.  **Instale as dependências do projeto:**
    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente:**
    Copie o arquivo de exemplo e preencha com suas informações.
    ```bash
    cp .env-example .env
    ```
    > **Nota:** As credenciais padrão no `.env-example` já estão configuradas para funcionar com o `docker-compose.yml`.

4.  **Inicie o banco de dados com Docker:**
    Este comando irá iniciar um container PostgreSQL em segundo plano.
    ```bash
    docker-compose up -d
    ```

5.  **Execute as migrações do TypeORM:**
    Este comando criará as tabelas no seu banco de dados.
    ```bash
    npm run migration:run
    ```

6.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

O servidor estará disponível em `http://localhost:8000` (ou na porta que você definir no seu arquivo `.env`).

## 📜 Uso e Endpoints da API

A seguir, uma lista de alguns endpoints já implementados ou planejados.

*   `POST /auth/register`: Registra uma nova organização e seu usuário proprietário.
*   `POST /auth/login`: Realiza o login e retorna um token JWT.
*   `GET /users`: Lista os usuários da organização.
*   `POST /customers`: Cria um novo cliente.
*   `GET /customers`: Lista os clientes da organização.
*   ... e muito mais!

> A documentação completa da API será adicionada futuramente (Swagger/OpenAPI).

## 🗃️ Esquema do Banco de Dados

O banco de dados foi projetado para ser escalável e eficiente, com relacionamentos claros entre as entidades principais: `Organization`, `User`, `Customer`, `Contact`, `Deal`, `Task`, `Product`, etc.

## 📄 Licença

Distribuído sob a Licença MIT. Veja `LICENSE.txt` para mais informações.