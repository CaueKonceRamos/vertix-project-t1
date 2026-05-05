import express from 'express'
import * as classroomController from '../controllers/classroom.controller.js'
import { requireTeacher } from '../middleware/auth.middleware.js'

const router = express.Router()

// Criar turma (apenas professor)
router.post('/', requireTeacher, classroomController.createClassroom)

// Listar minhas turmas
router.get('/', classroomController.listMyClassrooms)

// Entrar em turma com código
router.post('/join', classroomController.joinClassroom)

// Obter detalhes da turma
router.get('/:id', classroomController.getClassroom)

// Listar membros
router.get('/:id/members', classroomController.getClassroomMembers)

// Sair da turma (aluno)
router.delete('/:id/leave', classroomController.leaveClassroom)

// Remover membro (apenas professor)
router.delete('/:id/members/:userId', requireTeacher, classroomController.removeClassroomMember)

// Deletar turma (apenas professor)
router.delete('/:id', requireTeacher, classroomController.deleteClassroom)

export default router
