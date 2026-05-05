import sqlite3 from 'sqlite3'
import { promisify } from 'util'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../../voltix.db')

let db = null

export function getDatabase() {
  return db
}

export async function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('❌ Erro ao conectar ao banco:', err)
        reject(err)
        return
      }

      console.log('✅ Conectado ao SQLite:', DB_PATH)

      // Habilitar foreign keys
      db.run('PRAGMA foreign_keys = ON', (err) => {
        if (err) reject(err)
      })

      // Criar tabelas
      createTables().then(resolve).catch(reject)
    })
  })
}

async function createTables() {
  const run = promisify(db.run.bind(db))

  try {
    console.log('📋 Criando tabelas...')

    // 👤 Tabela de usuários
    await run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT CHECK(role IN ('teacher', 'student')) NOT NULL,
        avatar TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('  ✓ Tabela users criada')

    // 🏫 Tabela de turmas
    await run(`
      CREATE TABLE IF NOT EXISTS classrooms (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT,
        privacy TEXT CHECK(privacy IN ('public', 'private')) DEFAULT 'public',
        teacher_id TEXT NOT NULL,
        invite_code TEXT UNIQUE NOT NULL,
        max_students INTEGER DEFAULT 30,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)
    console.log('  ✓ Tabela classrooms criada')

    // Adicionar colunas existentes se o banco já tiver a tabela
    const classroomColumns = await dbAll(`PRAGMA table_info(classrooms)`)
    const classroomColumnNames = classroomColumns.map(column => column.name)

    if (!classroomColumnNames.includes('category')) {
      await run(`ALTER TABLE classrooms ADD COLUMN category TEXT`)
    }

    if (!classroomColumnNames.includes('privacy')) {
      await run(`ALTER TABLE classrooms ADD COLUMN privacy TEXT DEFAULT 'public'`)
    }

    // 👥 Tabela de membros da turma
    await run(`
      CREATE TABLE IF NOT EXISTS classroom_users (
        id TEXT PRIMARY KEY,
        classroom_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        role TEXT CHECK(role IN ('teacher', 'student')) NOT NULL,
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(classroom_id, user_id)
      )
    `)
    console.log('  ✓ Tabela classroom_users criada')

    // 💬 Tabela de mensagens
    await run(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        classroom_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)
    console.log('  ✓ Tabela messages criada')

    // 📁 Tabela de projetos
    await run(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        user_id TEXT NOT NULL,
        classroom_id TEXT,
        data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE
      )
    `)
    console.log('  ✓ Tabela projects criada')

    // 📊 Criar índices para melhor performance
    await run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`)
    await run(`CREATE INDEX IF NOT EXISTS idx_classrooms_teacher ON classrooms(teacher_id)`)
    await run(`CREATE INDEX IF NOT EXISTS idx_classroom_users_user ON classroom_users(user_id)`)
    await run(`CREATE INDEX IF NOT EXISTS idx_messages_classroom ON messages(classroom_id)`)
    await run(`CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id)`)
    await run(`CREATE INDEX IF NOT EXISTS idx_projects_classroom ON projects(classroom_id)`)

    console.log('✅ Banco de dados inicializado com sucesso!')
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error)
    throw error
  }
}

// Helpers para queries
export function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err)
      else resolve({ id: this.lastID, changes: this.changes })
    })
  })
}

export function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err)
      else resolve(row)
    })
  })
}

export function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err)
      else resolve(rows || [])
    })
  })
}
