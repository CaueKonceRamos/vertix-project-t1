import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'

import { initializeDatabase } from './src/database/init.js'
import authRoutes from './src/routes/auth.routes.js'
import classroomRoutes from './src/routes/classroom.routes.js'
import projectRoutes from './src/routes/project.routes.js'
import messageRoutes from './src/routes/message.routes.js'
import userRoutes from './src/routes/user.routes.js'
import { authenticateToken } from './src/middleware/auth.middleware.js'

// Configurar variáveis de ambiente
dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5175',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
})

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
app.use('/api/messages', messageRoutes)

// WebSocket - Chat em tempo real
const connectedUsers = new Map()

io.on('connection', (socket) => {
  console.log(`✅ Usuário conectado: ${socket.id}`)

  // Armazenar informação do usuário
  socket.on('user-join', (userData) => {
    connectedUsers.set(socket.id, userData)
    console.log(`👤 ${userData.name} entrou no chat`)
  })

  // Mensagem em tempo real
  socket.on('send-message', (data) => {
    console.log(`💬 Mensagem recebida:`, data)
    // Broadcast para todos na sala
    io.emit('receive-message', {
      id: uuidv4(),
      ...data,
      timestamp: new Date()
    })
  })

  // Desconectar
  socket.on('disconnect', () => {
    const user = connectedUsers.get(socket.id)
    connectedUsers.delete(socket.id)
    console.log(`❌ ${user?.name || 'Usuário'} desconectou`)
  })
})

// Inicializar banco de dados
await initializeDatabase()

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err)
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor'
  })
})

// Iniciar servidor
const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  ⚡ VOLTIX Backend - Iniciado           ║
║  Port: ${PORT}                          ║
║  Environment: ${process.env.NODE_ENV}       ║
║  URL: http://localhost:${PORT}         ║
╚════════════════════════════════════════╝
  `)
})

export { io }
