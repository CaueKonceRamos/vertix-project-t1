// 🏗️ VOLTIX - Arquitetura Lógica do Sistema
// Versão: 1.0 (MVP Profissional)

/**
 * ============================================
 * 📋 ESTRUTURA DE DADOS E REGRAS DE NEGÓCIO
 * ============================================
 */

// 1️⃣ TIPOS DE USUÁRIO
const USER_TYPES = {
  TEACHER: 'teacher',    // Professor
  STUDENT: 'student'     // Estudante
}

// 2️⃣ MODELOS DO BANCO DE DADOS

// 👤 users
const UserModel = {
  id: 'uuid',
  name: 'string',
  email: 'string (unique)',
  password: 'string (hashed)',
  role: 'teacher | student',
  avatar: 'string (URL)',
  created_at: 'timestamp'
}

// 🏫 classrooms (turmas)
const ClassroomModel = {
  id: 'uuid',
  name: 'string',
  description: 'string',
  teacher_id: 'uuid (FK users)',
  invite_code: 'string (6 chars, unique)',
  max_students: 'integer',
  created_at: 'timestamp',
  updated_at: 'timestamp'
}

// 👥 classroom_users (membros da turma)
const ClassroomUserModel = {
  id: 'uuid',
  classroom_id: 'uuid (FK)',
  user_id: 'uuid (FK)',
  role: 'teacher | student',
  joined_at: 'timestamp'
}

// 💬 messages (chat)
const MessageModel = {
  id: 'uuid',
  classroom_id: 'uuid (FK)',
  user_id: 'uuid (FK)',
  message: 'string',
  created_at: 'timestamp'
}

// 📁 projects (projetos)
const ProjectModel = {
  id: 'uuid',
  name: 'string',
  description: 'string',
  user_id: 'uuid (FK)',
  classroom_id: 'uuid (FK, nullable)',
  data: 'JSON (estrutura do projeto)',
  created_at: 'timestamp',
  updated_at: 'timestamp'
}

/**
 * ============================================
 * ⚙️ REGRAS DE NEGÓCIO
 * ============================================
 */

// 🔐 PROFESSOR (TEACHER)
const TEACHER_RULES = {
  canCreateClassroom: true,
  canInviteStudents: true,
  canCreatePersonalProjects: true,
  canCreateClassroomProjects: true,
  canViewStudentProjects: true,
  canDeleteClassroom: true,
  canManageMembers: true
}

// 🎓 ESTUDANTE (STUDENT)
const STUDENT_RULES = {
  canCreateClassroom: false,
  canInviteStudents: false,
  canCreatePersonalProjects: true,
  canCreateClassroomProjects: true,
  canViewStudentProjects: false, // só próprios
  canDeleteClassroom: false,
  canManageMembers: false,
  canJoinClassroomWithCode: true
}

// 📝 VALIDAÇÕES
const VALIDATIONS = {
  passwordMinLength: 8,
  passwordRequireNumbers: true,
  passwordRequireSpecialChars: false,
  emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  inviteCodeLength: 6,
  inviteCodeCharacters: 'A-Z0-9' // maiúsculas + números
}

/**
 * ============================================
 * 🔄 FLUXOS DO SISTEMA
 * ============================================
 */

// 1️⃣ REGISTRO DE NOVO USUÁRIO
const FLOW_REGISTER = `
INPUT:
  - name: string
  - email: string
  - password: string
  - confirmPassword: string
  - role: 'teacher' | 'student'

VALIDATIONS:
  ✓ name: não vazio
  ✓ email: válido + não existe
  ✓ password === confirmPassword
  ✓ password: mínimo 8 caracteres
  
PROCESS:
  1. Hash password
  2. Create user com role
  3. Return JWT token
  
RESPONSE:
  { id, name, email, role, token }
`

// 2️⃣ PROFESSOR CRIA TURMA
const FLOW_CREATE_CLASSROOM = `
AUTHORIZATION:
  ✓ user.role === 'teacher'

INPUT:
  - name: string
  - description: string
  - max_students: integer (opcional)

PROCESS:
  1. Generate invite_code (6 random chars)
  2. Create classroom
  3. Add teacher como membro (role: teacher)
  4. Return classroom com invite_code
  
RESPONSE:
  { id, name, invite_code, created_at }
`

// 3️⃣ ALUNO ENTRA EM TURMA
const FLOW_JOIN_CLASSROOM = `
INPUT:
  - invite_code: string (6 chars)

VALIDATIONS:
  ✓ invite_code: existe
  ✓ user: não está na turma já
  ✓ classroom: não está lotada

PROCESS:
  1. Find classroom by invite_code
  2. Check se aluno já está na turma
  3. Add aluno como membro (role: student)
  4. Return classroom info
  
RESPONSE:
  { classroom_id, name, members_count }
`

// 4️⃣ ENVIAR MENSAGEM NO CHAT
const FLOW_SEND_MESSAGE = `
INPUT:
  - classroom_id: uuid
  - message: string

AUTHORIZATION:
  ✓ user: membro da classroom

VALIDATIONS:
  ✓ message: não vazio
  ✓ classroom_id: existe

PROCESS:
  1. Create message
  2. Emit WebSocket event (real-time)
  3. Return message com timestamp
  
RESPONSE:
  { id, user_id, user_name, message, created_at }
`

// 5️⃣ CRIAR PROJETO
const FLOW_CREATE_PROJECT = `
INPUT:
  - name: string
  - classroom_id: uuid (opcional)
  - data: JSON

AUTHORIZATION:
  ✓ user: membro da classroom (se classroom_id)

PROCESS:
  1. Validate user authority
  2. Create project
  3. If classroom_id: link to classroom
  4. Return project
  
RESPONSE:
  { id, name, user_id, classroom_id, created_at }
`

/**
 * ============================================
 * 🚫 REGRAS DE SEGURANÇA
 * ============================================
 */

const SECURITY_RULES = {
  authentication: {
    rule: 'JWT token obrigatório',
    expiry: '7 dias',
    refreshToken: 'suporta'
  },
  authorization: {
    classroom: 'Só membro pode acessar',
    project: 'Só owner ou teacher pode editar',
    message: 'Só membro pode enviar'
  },
  data: {
    password: 'Sempre hasheado (bcrypt)',
    email: 'Verificação não obrigatória (MVP)'
  }
}

/**
 * ============================================
 * 📊 ESTRUTURA JSON DO PROJETO
 * ============================================
 */

const PROJECT_JSON_STRUCTURE = {
  version: '1.0',
  name: 'Meu Primeiro Circuito',
  description: 'LED com Arduino',
  
  objects: [
    {
      id: 'obj-1',
      type: 'led',           // led, resistor, battery, arduino, button, cube, sphere...
      position: { x: 100, y: 150 },
      rotation: 0,
      scale: 1,
      properties: {
        color: 'red',
        brightness: 1.0
      }
    }
  ],
  
  connections: [
    {
      id: 'conn-1',
      from: 'obj-1.pin-1',   // objeto.pino
      to: 'obj-2.pin-2',
      connectionType: 'wire'
    }
  ],
  
  simulation: {
    state: 'idle',           // idle | running | paused
    code: `
void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}
    `
  }
}

/**
 * ============================================
 * 🌐 ENDPOINTS DA API
 * ============================================
 */

const API_ENDPOINTS = {
  // 🔐 Autenticação
  'POST /api/auth/register': 'Registrar novo usuário',
  'POST /api/auth/login': 'Login (email + senha)',
  'POST /api/auth/refresh': 'Refresh token',
  'POST /api/auth/logout': 'Logout',
  
  // 👤 Usuário
  'GET /api/users/me': 'Perfil atual',
  'PUT /api/users/me': 'Atualizar perfil',
  
  // 🏫 Turmas
  'POST /api/classrooms': '[TEACHER] Criar turma',
  'GET /api/classrooms': 'Listar minhas turmas',
  'GET /api/classrooms/:id': 'Detalhes da turma',
  'POST /api/classrooms/join': '[STUDENT] Entrar com código',
  'DELETE /api/classrooms/:id': '[TEACHER] Deletar turma',
  
  // 👥 Membros
  'GET /api/classrooms/:id/members': 'Listar membros',
  'DELETE /api/classrooms/:id/members/:userId': '[TEACHER] Remover membro',
  
  // 💬 Chat
  'POST /api/classrooms/:id/messages': 'Enviar mensagem',
  'GET /api/classrooms/:id/messages': 'Listar mensagens',
  
  // 📁 Projetos
  'POST /api/projects': 'Criar projeto',
  'GET /api/projects': 'Listar meus projetos',
  'GET /api/projects/:id': 'Detalhes do projeto',
  'PUT /api/projects/:id': 'Editar projeto',
  'DELETE /api/projects/:id': 'Deletar projeto',
  'GET /api/classrooms/:id/projects': 'Projetos da turma'
}

/**
 * ============================================
 * 📈 COMPARATIVO: VOCÊ vs TINKERCAD
 * ============================================
 */

const COMPARISON = {
  feature: {
    Tinkercad: 'Voltix',
    'Editor 3D': '✓ / ✓',
    'Circuitos': '✓ / ✓',
    'Simulação': '✓ / ✓ (básico)',
    'Turmas': '✓ / ✓',
    'Chat': '✗ / ✓',
    'Projetos pessoais': '✗ / ✓',
    'Código Arduino': '✓ / ✓',
    'Social (compartilhar)': '✗ / ✓ (futuro)'
  }
}

module.exports = {
  USER_TYPES,
  TEACHER_RULES,
  STUDENT_RULES,
  VALIDATIONS,
  SECURITY_RULES,
  API_ENDPOINTS,
  PROJECT_JSON_STRUCTURE
}
