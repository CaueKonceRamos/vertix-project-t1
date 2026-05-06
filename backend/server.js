import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import { initializeDatabase } from './src/database/init.js'
import authRoutes from './src/routes/auth.routes.js'
import classroomRoutes from './src/routes/classroom.routes.js'
import projectRoutes from './src/routes/project.routes.js'
import userRoutes from './src/routes/user.routes.js'
import { authenticateToken } from './src/middleware/auth.middleware.js'

// Configurar variáveis de ambiente
dotenv.config()

const app = express()

// Middleware
app.use(express.json())
app.use(cors())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() })
})

// Rotas públicas
app.use('/api/auth', authRoutes)

// Middleware de autenticação para rotas protegidas
app.use(authenticateToken)

// Rotas protegidas
app.use('/api/users', userRoutes)
app.use('/api/classrooms', classroomRoutes)
app.use('/api/projects', projectRoutes)

// Inicializar banco de dados
await initializeDatabase()

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err)
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor'
  })
})

// Iniciar servidor apenas em ambiente local
const PORT = process.env.PORT || 5000
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║  ⚡ VOLTIX Backend - Iniciado           ║
║  Port: ${PORT}                          ║
║  Environment: ${process.env.NODE_ENV}       ║
║  URL: http://localhost:${PORT}         ║
╚════════════════════════════════════════╝
    `)
  })
}

export default app
