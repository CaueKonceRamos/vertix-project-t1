import express from 'express'
import * as projectController from '../controllers/project.controller.js'

const router = express.Router()

// Criar projeto
router.post('/', projectController.createProject)

// Listar meus projetos
router.get('/', projectController.listMyProjects)

// Listar projetos da turma
router.get('/classroom/:classroomId', projectController.getClassroomProjects)

// Obter detalhes do projeto
router.get('/:id', projectController.getProject)

// Editar projeto
router.put('/:id', projectController.updateProject)

// Deletar projeto
router.delete('/:id', projectController.deleteProject)

export default router
