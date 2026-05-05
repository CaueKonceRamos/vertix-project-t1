import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'voltix-secret-key'

export function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || '7d' }
  )
}

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('❌ Erro ao verificar token:', err.message)
      return res.status(403).json({ error: 'Token inválido ou expirado' })
    }

    req.user = user
    next()
  })
}

// Middleware para verificar se é professor
export function requireTeacher(req, res, next) {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Apenas professores podem fazer isso' })
  }
  next()
}

// Middleware para verificar se é estudante
export function requireStudent(req, res, next) {
  if (req.user.role !== 'student') {
    return res.status(403).json({ error: 'Apenas estudantes podem fazer isso' })
  }
  next()
}
