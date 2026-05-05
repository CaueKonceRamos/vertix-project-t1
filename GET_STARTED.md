# 🚀 VOLTIX - COMEÇAR AQUI

## 📌 O que é Voltix?

**Voltix** é uma plataforma IoT visual (tipo Tinkercad), onde:
- 👨‍🏫 **Professores** criam turmas e acompanham alunos
- 🎓 **Alunos** entram em turmas com código + criam projetos
- 💬 **Chat** em tempo real dentro das turmas
- 📁 **Projetos** compartilhados na galeria da turma
- ⚡ **Simulação** de circuitos e Arduino

---

## 🎯 Passo 1: Setup do Backend (Node.js)

### Instalar

```bash
# Entrar na pasta backend
cd backend

# Instalar dependências
npm install

# Criar arquivo .env (já vem pronto)
# Verificar: PORT, DATABASE_PATH, JWT_SECRET
```

### Rodar

```bash
# Desenvolvimento (com hot-reload)
npm run dev

# Produção
npm start
```

✅ Backend rodará em: `http://localhost:5000`

---

## 🎯 Passo 2: Frontend React (já pronto)

### Já está em `/src` com:
- ✅ Login/Register
- ✅ Editor Canvas
- ✅ Biblioteca de objetos
- ✅ Simulação básica
- ✅ Footer com copyright

### Conectar ao Backend

Editar `src/services/api.js` (vou criar):

```javascript
const API_BASE = 'http://localhost:5000/api'

export const api = {
  auth: {
    register: (data) => fetch(`${API_BASE}/auth/register`, { ... }),
    login: (data) => fetch(`${API_BASE}/auth/login`, { ... })
  },
  classroom: {
    create: (data) => fetch(`${API_BASE}/classrooms`, { ... }),
    join: (code) => fetch(`${API_BASE}/classrooms/join`, { ... })
  }
}
```

### Rodar Frontend

```bash
# Na raiz do projeto (já configurado com Vite)
npm run dev

# Acesso: http://localhost:5175
```

---

## 📊 Fluxo Completo (User Journey)

### 👨‍🏫 PROFESSOR

```
1. Acessa: http://localhost:5175
2. Clica "Registrar"
   - Nome: "Maria Silva"
   - Email: "maria@school.com"
   - Senha: "senha123456"
   - Tipo: "Professor"
3. Entra no dashboard
4. Clica "+ Nova Turma"
   - Nome: "Eletrônica 101"
   - Descrição: "Curso de circuitos básicos"
5. Sistema gera código: "ABC123"
6. Compartilha com alunos 📱
7. Alunos entram com código
8. Cria projetos + acompanha alunos
```

### 🎓 ESTUDANTE

```
1. Acessa: http://localhost:5175
2. Clica "Registrar"
   - Nome: "João Santos"
   - Email: "joao@student.com"
   - Senha: "senha123456"
   - Tipo: "Estudante"
3. Entra no dashboard
4. Clica "Entrar em Turma"
   - Código: "ABC123" (professor passou)
5. Entra na turma!
   - Vê chat da turma
   - Vê projetos compartilhados
   - Cria seus próprios projetos
6. Clica "+ Novo Projeto"
   - Arrastra objetos do canvas
   - Cria circuito
   - Simula
   - Salva
```

---

## 🔑 Endpoints Principais

Todos precisam de token JWT no header!

```bash
# AUTENTICAÇÃO (sem token)
POST /api/auth/register
POST /api/auth/login

# TURMAS (com token)
POST   /api/classrooms              # Criar (Professor)
GET    /api/classrooms              # Listar minhas
POST   /api/classrooms/join         # Entrar com código
GET    /api/classrooms/:id          # Detalhes
GET    /api/classrooms/:id/members  # Membros

# PROJETOS (com token)
POST   /api/projects                # Criar
GET    /api/projects                # Listar meus
PUT    /api/projects/:id            # Editar
DELETE /api/projects/:id            # Deletar
GET    /api/projects/classroom/:id  # Galeria turma

# CHAT (com token)
POST   /api/classrooms/:id/messages # Enviar
GET    /api/classrooms/:id/messages # Listar
```

Ver `backend/API_DOCUMENTATION.md` para todos.

---

## 💾 Dados de Teste

### Professor
```
Email: teacher@test.com
Senha: senha123456
Tipo: Professor
```

### Aluno
```
Email: student@test.com
Senha: senha123456
Tipo: Estudante
```

---

## 🗄️ Banco de Dados

- **SQLite** local em `voltix.db`
- Tabelas criadas automaticamente
- Sem instalação extra necessária

Se precisar limpar:
```bash
rm voltix.db
npm run dev  # Recria automaticamente
```

---

## 🧪 Testar API com cURL

### 1. Registrar
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria",
    "email": "maria@test.com",
    "password": "senha123456",
    "confirmPassword": "senha123456",
    "role": "teacher"
  }'
```

Resposta:
```json
{
  "user": { "id": "...", "name": "Maria", "role": "teacher" },
  "token": "eyJhbGc..."
}
```

### 2. Salvar token
```bash
TOKEN="eyJhbGc..."
```

### 3. Criar turma
```bash
curl -X POST http://localhost:5000/api/classrooms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Eletrônica 101",
    "description": "Curso básico"
  }'
```

---

## 📁 Estrutura Final

```
tinkerc/
├── src/                    # React Frontend (já pronto)
│   ├── components/
│   ├── context/
│   ├── styles/
│   └── services/           # API calls
├── backend/                # Node.js Backend (novo)
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── database/
│   ├── server.js
│   └── package.json
├── SYSTEM_ARCHITECTURE.md  # Documentação
├── README.md
└── package.json            # Frontend
```

---

## ⚙️ Environment Variables

### `.env` (Backend)
```env
NODE_ENV=development
PORT=5000
DATABASE_PATH=./voltix.db
JWT_SECRET=voltix-secret-key-change-in-production-2026
JWT_EXPIRY=7d
CORS_ORIGIN=http://localhost:5175
```

### Frontend (Vite)
```javascript
// vite.config.js
server: {
  port: 5175,
  proxy: {
    '/api': 'http://localhost:5000'
  }
}
```

---

## 🚀 Comandos Importantes

```bash
# Frontend
npm install          # Instalar
npm run dev         # Rodar desenvolvimento
npm run build       # Build produção

# Backend
cd backend
npm install
npm run dev         # Rodar com nodemon
npm start           # Produção

# Testar API
npm test            # (quando pronto)
```

---

## 🐛 Troubleshooting

### Erro: "CORS error"
- Verificar se backend está rodando em `http://localhost:5000`
- Verificar .env CORS_ORIGIN

### Erro: "Cannot GET /api/classrooms"
- Backend não está rodando
- Executar: `cd backend && npm run dev`

### Erro: "Database locked"
- Fechar outro process do Node
- Deletar `voltix.db` e reiniciar

### Erro: "Invalid token"
- Token expirou (gerar novo)
- JWT_SECRET diferente em .env

---

## 📈 Próximas Features

- [ ] Integração frontend ↔ backend
- [ ] Autenticação com JWT no React
- [ ] Upload de arquivos
- [ ] Notificações em tempo real
- [ ] Dark mode
- [ ] Exportar projetos
- [ ] Backup automático

---

## 🧠 Arquitetura Final

```
Usuario (Browser)
    ↓
Frontend React (5175)
    ↓ (HTTP + JWT)
Backend Node.js (5000)
    ↓
SQLite Database
```

---

## 📚 Documentação

- `SYSTEM_ARCHITECTURE.md` - Lógica de negócio
- `backend/README.md` - Backend específico
- `backend/API_DOCUMENTATION.md` - Todos endpoints
- `README.md` - Geral

---

## ✅ Checklist

```
⚡ Backend
  [ ] npm install
  [ ] npm run dev (rodando em 5000)
  [ ] Testes com cURL OK

🎨 Frontend  
  [ ] npm run dev (rodando em 5175)
  [ ] Página de login aparecendo
  [ ] Conectar ao backend

🗄️ Banco
  [ ] voltix.db criado
  [ ] Tabelas OK

🧪 Testes
  [ ] Registrar usuario
  [ ] Login
  [ ] Criar turma
  [ ] Entrar em turma
  [ ] Criar projeto
```

---

## 🎉 Você está pronto!

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
npm run dev

# Acesso
Frontend: http://localhost:5175
Backend: http://localhost:5000
```

**Divirta-se! 🚀⚡**
