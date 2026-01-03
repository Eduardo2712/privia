# 🤖 Privia

**Privia** é uma plataforma de chat inteligente com RAG (Retrieval-Augmented Generation) que permite fazer upload de documentos e conversar com eles através de IA. O sistema extrai informações dos seus arquivos e responde perguntas contextualizadas com base no conteúdo.

## ✨ Funcionalidades

-   📄 **Upload de Documentos**: Suporte para txt
-   🔍 **Busca Semântica**: Encontre informações relevantes em seus documentos usando busca vetorial
-   💬 **Chat Inteligente**: Converse com a IA sobre o conteúdo dos seus documentos
-   🧠 **RAG (Retrieval-Augmented Generation)**: Respostas contextualizadas baseadas no conteúdo real dos documentos
-   🔐 **Autenticação JWT**: Sistema seguro de login e registro
-   🎯 **Histórico de Mensagens**: Acesso ao histórico completo das conversas
-   ⚡ **Real-time**: Comunicação em tempo real via WebSockets

## 🛠️ Tecnologias

### Backend (API)

-   **NestJS** - Framework Node.js
-   **TypeORM** - ORM para PostgreSQL
-   **Qdrant** - Banco de dados vetorial
-   **BullMQ** - Processamento de filas
-   **MinIO** - Armazenamento de arquivos
-   **Google Generative AI / Ollama** - Modelos de IA

### Frontend (Web)

-   **Next.js** - Framework React
-   **Socket.io** - Comunicação em tempo real
-   **Tailwind CSS** - Estilização

## 📋 Pré-requisitos

-   Docker e Docker Compose
-   Node.js 18+ (para desenvolvimento local)
-   Git

## 🚀 Instalação e Uso

### 1. Clone o repositório

### 2. Configure as variáveis de ambiente (arquivos .env -> existem exemplos nomeados com .env.example)

### 3. Inicie os serviços com Docker (recomendado utilizar Docker somente no Minio, Ollama e Qdrant)

### 4. Configure o modelo de IA (Ollama)

Se estiver usando Ollama, baixe o modelo:

```bash
docker exec -it privia-ollama ollama pull qwen2.5:7b-instruct
docker exec -it privia-ollama ollama pull bge-m3
```

### 5. Acesse a aplicação

-   **Frontend**: http://localhost:3000
-   **API**: http://localhost:8080/api
-   **API Docs**: http://localhost:8080/api/docs
-   **MinIO Console**: http://localhost:9001

## 🔧 Desenvolvimento Local

### Backend

```bash
cd api
npm install
npm run start:dev
```

### Frontend

```bash
cd web
npm install
npm run dev
```

## 📚 Como Usar

1. **Registre-se** ou faça login na aplicação
2. **Faça upload** de documentos (PDF, TXT, etc.)
3. **Aguarde** o processamento do arquivo
4. **Converse** com a IA sobre o conteúdo do documento
5. **Pesquise** informações específicas nos seus documentos

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## 🔐 Segurança

Para reportar vulnerabilidades de segurança, entre em contato através das issues do GitHub.

![Imagem](https://github.com/Eduardo2712/privia/blob/main/images/image_1.png)

![Imagem](https://github.com/Eduardo2712/privia/blob/main/images/image_2.png)

![Imagem](https://github.com/Eduardo2712/privia/blob/main/images/image_3.png)

![Imagem](https://github.com/Eduardo2712/privia/blob/main/images/image_4.png)

![Imagem](https://github.com/Eduardo2712/privia/blob/main/images/image_5.png)
