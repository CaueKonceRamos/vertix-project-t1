# ⚡ Voltix - Backend Node.js

Sistema completo de autenticação, turmas, chat e projetos para a plataforma IoT visual **Voltix**.

## 🏗️ Arquitetura

```
backend/
├── src/
│   ├── controllers/       # Lógica de negócio
│   │   ├── auth.controller.js
│   │   ├── classroom.controller.js
│   │   ├── project.controller.js
│   │   ├── message.controller.js
│   │   └── user.controller.js
│   ├── routes/           # Endpoints da API
│   │   ├── auth.routes.js
│   │   ├── classroom.routes.js
│   │   ├── project.routes.js
│   │   ├── message.routes.js
│   │   └── user.routes.js
│   ├── middleware/       # Autenticação
│   │   └── auth.middleware.js
│   ├── database/         # SQLite
│   │   └── init.js
│   └── utils/            # Utilitários
├── server.js             # Entrada principal
├── package.json
├── .env
└── API_DOCUMENTATION.md
```

## 🚀 Quick Start

### 1. Instalar
```bash
cd backend
npm install
```

### 2. Configurar .env
```env
PORT=5000
DATABASE_PATH=./voltix.db
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5175
```

### 3. Rodar
```bash
npm run dev    # Desenvolvimento (com nodemon)
npm start      # Produção
```

Servidor disponível em: `http://localhost:5000`

---

## 🧠 Regras de Negócio

### 👤 Usuário
- **Registrar**: nome, email, senha, role (teacher/student)
- **Login**: email + senha → JWT token
- **Perfil**: ver e atualizar informações

### 🏫 Turma
- **Criar** (Professor): gera código de 6 caracteres
- **Entrar** (Aluno): com código válido
- **Membros**: listar e remover (Professor)
- **Deletar** (Professor): remove turma e todos os dados

### 💬 Chat
- **Enviar**: mensagem de texto (membro apenas)
- **Listar**: histórico de mensagens
- **Deletar**: dono ou professor

### 📁 Projeto
- **Criar**: pessoal ou vinculado à turma
- **Editar**: apenas dono
- **Deletar**: apenas dono
- **Galeria**: ver projetos da turma

---

## 🔐 Segurança

- ✅ JWT tokens (validade 7 dias)
- ✅ Senhas hasheadas (bcryptjs)
- ✅ Validação em todos endpoints
- ✅ Autorização por role
- ✅ Foreign keys no banco

---

## 📊 Banco de Dados (SQLite)

### Tabelas

**users**
- id (UUID)
- name
- email (único)
- password (hashed)
- role (teacher | student)
- avatar
- created_at, updated_at

**classrooms**
- id (UUID)
- name
- description
- teacher_id (FK)
- invite_code (6 chars, único)
- max_students
- created_at, updated_at

**classroom_users** (N:N)
- id (UUID)
- classroom_id (FK)
- user_id (FK)
- role (teacher | student)
- joined_at

**messages**
- id (UUID)
- classroom_id (FK)
- user_id (FK)
- message
- created_at

**projects**
- id (UUID)
- name
- description
- user_id (FK)
- classroom_id (FK, nullable)
- data (JSON)
- created_at, updated_at

---

## 🌐 WebSocket (Real-time)

### Eventos

**user-join**
```javascript
socket.emit('user-join', { id, name })
```

**send-message**
```javascript
socket.emit('send-message', { classroom_id, user_id, message })
```

**receive-message**
```javascript
socket.on('receive-message', (data) => { ... })
```

---

## 📝 Exemplos de Uso

### Registrar e Login
```javascript
// Registrar
const res = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'João',
    email: 'joao@test.com',
    password: 'senha123456',
    confirmPassword: 'senha123456',
    role: 'teacher'
  })
})

const { token } = await res.json()
localStorage.setItem('token', token)
```

### Criar Turma
```javascript
const res = await fetch('http://localhost:5000/api/classrooms', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Eletrônica 101',
    description: 'Curso de eletrônica básica'
  })
})

const { classroom } = await res.json()
console.log(`Código: ${classroom.invite_code}`)
```

### Criar Projeto
```javascript
const res = await fetch('http://localhost:5000/api/projects', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'LED Piscante',
    classroom_id: 'optional-uuid',
    data: {
      objects: [...],
      connections: [...],
      simulation: { state: 'idle', code: '' }
    }
  })
})
```

---

## 🧪 Testar API

### Com Postman
1. Importar collection de `/API_DOCUMENTATION.md`
2. Usar variável `{{token}}` para requests autenticadas

### Com cURL
Ver exemplos em `API_DOCUMENTATION.md`

---

## 🚀 Deploy

### Docker (opcional)
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

```bash
docker build -t voltix-backend .
docker run -p 5000:5000 -e DATABASE_PATH=/data/voltix.db voltix-backend
```

### Heroku / Railway
```bash
# Preparar para produção
npm run build

# Variáveis de ambiente
PORT=5000
JWT_SECRET=sua-chave-segura
DATABASE_PATH=/tmp/voltix.db
```

---

## 📚 Documentação Completa

Ver `API_DOCUMENTATION.md` para todos os endpoints e exemplos.

---

## ❓ Troubleshooting

**Erro: "Cannot find module"**
```bash
rm -rf node_modules
npm install
```

**Database locked**
```bash
rm voltix.db
npm run dev
```

**JWT invalid**
- Verificar se token está no header: `Authorization: Bearer TOKEN`
- Verificar se JWT_SECRET é o mesmo em .env

---

## 🧠 Próximos Passos

- [ ] Integração com React Frontend
- [ ] Simulação de circuitos em tempo real
- [ ] Sistema de notificações
- [ ] Upload de arquivos
- [ ] Backup automático de projetos
- [ ] API de Arduino integration

---

**⚡ Voltix Backend v1.0.0** - Made with ❤️
