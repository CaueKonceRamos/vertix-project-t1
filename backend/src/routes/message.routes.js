import express from 'express'
import * as messageController from '../controllers/message.controller.js'

const router = express.Router()

// Enviar mensagem
router.post('/:classroomId/send', messageController.sendMessage)

// Listar mensagens
router.get('/:classroomId', messageController.getMessages)

// Deletar mensagem
router.delete('/:classroomId/:messageId', messageController.deleteMessage)

export default router
