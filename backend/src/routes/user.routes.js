import express from 'express'
import * as userController from '../controllers/user.controller.js'

const router = express.Router()

// Obter perfil
router.get('/me', userController.getProfile)

// Atualizar perfil
router.put('/me', userController.updateProfile)

export default router
