import { v4 as uuidv4 } from 'uuid'
import bcryptjs from 'bcryptjs'
import { dbRun, dbGet } from '../database/init.js'
import { generateToken } from '../middleware/auth.middleware.js'

/**
 * ✅ REGISTRAR NOVO USUÁRIO
 * POST /api/auth/register
 */
export async function register(req, res) {
  try {
    const { name, email, password, confirmPassword, role } = req.body

    // Validações
    if (!name || !email || !password || !confirmPassword || !role) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' })
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Senhas não conferem' })
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Senha deve ter no mínimo 8 caracteres' })
    }

    if (!['teacher', 'student'].includes(role)) {
      return res.status(400).json({ error: 'Role deve ser "teacher" ou "student"' })
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Email inválido' })
    }

    // Verificar se email já existe
    const existingUser = await dbGet('SELECT id FROM users WHERE email = ?', [email])
    if (existingUser) {
      return res.status(409).json({ error: 'Email já cadastrado' })
    }

    // Hash da senha
    const salt = await bcryptjs.genSalt(10)
    const hashedPassword = await bcryptjs.hash(password, salt)

    // Criar usuário
    const userId = uuidv4()
    await dbRun(
      `INSERT INTO users (id, name, email, password, role)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, name, email, hashedPassword, role]
    )

    // Gerar token
    const token = generateToken({ id: userId, email, role })

    res.status(201).json({
      message: 'Usuário registrado com sucesso',
      user: { id: userId, name, email, role },
      token
    })

  } catch (error) {
    console.error('❌ Erro ao registrar:', error)
    res.status(500).json({ error: 'Erro ao registrar usuário' })
  }
}

/**
 * ✅ LOGIN
 * POST /api/auth/login
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body

    // Validações
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' })
    }

    // Buscar usuário
    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email])
    if (!user) {
      return res.status(401).json({ error: 'Email ou senha inválidos' })
    }

    // Verificar senha
    const passwordMatch = await bcryptjs.compare(password, user.password)
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Email ou senha inválidos' })
    }

    // Gerar token
    const token = generateToken({ id: user.id, email: user.email, role: user.role })

    res.json({
      message: 'Login realizado com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    })

  } catch (error) {
    console.error('❌ Erro ao fazer login:', error)
    res.status(500).json({ error: 'Erro ao fazer login' })
  }
}

/**
 * ✅ VERIFICAR TOKEN (OPCIONAL)
 * GET /api/auth/verify
 */
export async function verifyToken(req, res) {
  try {
    const user = await dbGet('SELECT id, name, email, role FROM users WHERE id = ?', [req.user.id])
    
    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' })
    }

    res.json({
      user,
      token: req.headers.authorization.split(' ')[1]
    })
  } catch (error) {
    console.error('❌ Erro ao verificar token:', error)
    res.status(500).json({ error: 'Erro ao verificar token' })
  }
}
