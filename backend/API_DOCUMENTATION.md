# ⚡ Voltix Backend - Node.js API

## 🚀 Setup Inicial

```bash
cd backend
npm install
npm run dev
```

Servidor rodará em: `http://localhost:5000`

---

## 📋 Endpoints da API

### 🔐 **Autenticação** (sem token)

#### Registrar
```bash
POST /api/auth/register

{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123456",
  "confirmPassword": "senha123456",
  "role": "student"  // ou "teacher"
}

Response:
{
  "user": { id, name, email, role },
  "token": "JWT_TOKEN"
}
```

#### Login
```bash
POST /api/auth/login

{
  "email": "joao@email.com",
  "password": "senha123456"
}

Response:
{
  "user": { id, name, email, role },
  "token": "JWT_TOKEN"
}
```

---

### 👤 **Usuário** (com token)

#### Obter Perfil
```bash
GET /api/users/me
Headers: Authorization: Bearer JWT_TOKEN

Response:
{
  "user": { id, name, email, role, avatar, created_at }
}
```

#### Atualizar Perfil
```bash
PUT /api/users/me
Headers: Authorization: Bearer JWT_TOKEN

{
  "name": "João Silva Updated",
  "avatar": "https://..."
}
```

---

### 🏫 **Turmas** (com token)

#### Criar Turma (PROFESSOR)
```bash
POST /api/classrooms
Headers: Authorization: Bearer JWT_TOKEN

{
  "name": "Eletrônica 101",
  "description": "Aprenda eletrônica básica",
  "max_students": 30
}

Response:
{
  "classroom": {
    "id": "uuid",
    "name": "Eletrônica 101",
    "invite_code": "ABC123"  // 6 caracteres
  }
}
```

#### Listar Minhas Turmas
```bash
GET /api/classrooms
Headers: Authorization: Bearer JWT_TOKEN

Response:
{
  "classrooms": [
    {
      "id": "uuid",
      "name": "Eletrônica 101",
      "invite_code": "ABC123",
      "member_count": 5
    }
  ]
}
```

#### Entrar em Turma (ALUNO)
```bash
POST /api/classrooms/join
Headers: Authorization: Bearer JWT_TOKEN

{
  "invite_code": "ABC123"
}

Response:
{
  "classroom": { id, name, teacher_id }
}
```

#### Obter Detalhes da Turma
```bash
GET /api/classrooms/:id
Headers: Authorization: Bearer JWT_TOKEN
```

#### Listar Membros
```bash
GET /api/classrooms/:id/members
Headers: Authorization: Bearer JWT_TOKEN

Response:
{
  "members": [
    {
      "id": "uuid",
      "name": "João",
      "email": "joao@email.com",
      "role": "student",
      "joined_at": "2026-04-28T..."
    }
  ]
}
```

#### Remover Membro (PROFESSOR)
```bash
DELETE /api/classrooms/:id/members/:userId
Headers: Authorization: Bearer JWT_TOKEN
```

#### Deletar Turma (PROFESSOR)
```bash
DELETE /api/classrooms/:id
Headers: Authorization: Bearer JWT_TOKEN
```

---

### 💬 **Chat / Mensagens** (com token)

#### Enviar Mensagem
```bash
POST /api/classrooms/:classroomId/messages
Headers: Authorization: Bearer JWT_TOKEN

{
  "message": "Alguém tem dúvida?"
}

Response:
{
  "msg": {
    "id": "uuid",
    "user_id": "uuid",
    "message": "Alguém tem dúvida?",
    "created_at": "2026-04-28T..."
  }
}
```

#### Listar Mensagens
```bash
GET /api/classrooms/:classroomId/messages
Headers: Authorization: Bearer JWT_TOKEN

Response:
{
  "messages": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "user_name": "João",
      "message": "Alguém tem dúvida?",
      "created_at": "2026-04-28T..."
    }
  ]
}
```

#### Deletar Mensagem (Dono ou Professor)
```bash
DELETE /api/classrooms/:classroomId/messages/:messageId
Headers: Authorization: Bearer JWT_TOKEN
```

---

### 📁 **Projetos** (com token)

#### Criar Projeto
```bash
POST /api/projects
Headers: Authorization: Bearer JWT_TOKEN

{
  "name": "LED Piscante",
  "description": "Projeto com LED",
  "classroom_id": "uuid (opcional)",
  "data": {
    "objects": [...],
    "connections": [...],
    "simulation": { ... }
  }
}

Response:
{
  "project": {
    "id": "uuid",
    "name": "LED Piscante",
    "user_id": "uuid",
    "classroom_id": null
  }
}
```

#### Listar Meus Projetos
```bash
GET /api/projects
Headers: Authorization: Bearer JWT_TOKEN

Response:
{
  "projects": [
    {
      "id": "uuid",
      "name": "LED Piscante",
      "user_id": "uuid",
      "classroom_id": null,
      "created_at": "2026-04-28T..."
    }
  ]
}
```

#### Obter Projeto
```bash
GET /api/projects/:id
Headers: Authorization: Bearer JWT_TOKEN
```

#### Editar Projeto
```bash
PUT /api/projects/:id
Headers: Authorization: Bearer JWT_TOKEN

{
  "name": "LED Piscante v2",
  "description": "Versão melhorada",
  "data": { ... }
}
```

#### Deletar Projeto
```bash
DELETE /api/projects/:id
Headers: Authorization: Bearer JWT_TOKEN
```

#### Listar Projetos da Turma
```bash
GET /api/projects/classroom/:classroomId
Headers: Authorization: Bearer JWT_TOKEN
```

---

## 🔒 Autenticação

Todos os endpoints (exceto `/auth/register` e `/auth/login`) precisam do header:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🗄️ Estrutura do Banco de Dados

- **users** - Usuários (professor/aluno)
- **classrooms** - Turmas
- **classroom_users** - Membros das turmas
- **messages** - Chat das turmas
- **projects** - Projetos

---

## 🧪 Testar com cURL

```bash
# Registrar
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João",
    "email": "joao@test.com",
    "password": "senha123456",
    "confirmPassword": "senha123456",
    "role": "teacher"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@test.com",
    "password": "senha123456"
  }'

# Criar turma (com token)
curl -X POST http://localhost:5000/api/classrooms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "name": "Eletrônica 101"
  }'
```

---

## 📊 Estrutura de Dados do Projeto (JSON)

```json
{
  "version": "1.0",
  "name": "LED Piscante",
  "objects": [
    {
      "id": "obj-1",
      "type": "led",
      "position": { "x": 100, "y": 150 },
      "rotation": 0,
      "scale": 1,
      "properties": { "color": "red" }
    }
  ],
  "connections": [
    {
      "id": "conn-1",
      "from": "obj-1.pin-1",
      "to": "obj-2.pin-2"
    }
  ],
  "simulation": {
    "state": "idle",
    "code": "void setup() { pinMode(13, OUTPUT); }"
  }
}
```

---

## 🚀 Deploy

```bash
# Build para produção
npm run build

# Ou rodar direto
npm start
```

---

**⚡ Voltix Backend - v1.0.0**
