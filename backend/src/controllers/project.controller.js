import { v4 as uuidv4 } from 'uuid'
import { dbRun, dbGet, dbAll } from '../database/init.js'

/**
 * ✅ CRIAR PROJETO
 * POST /api/projects
 */
export async function createProject(req, res) {
  try {
    const { name, description, classroom_id, data } = req.body

    if (!name) {
      return res.status(400).json({ error: 'Nome do projeto é obrigatório' })
    }

    // Se tem classroom_id, verificar se usuário pertence
    if (classroom_id) {
      const memberCheck = await dbGet(
        'SELECT * FROM classroom_users WHERE classroom_id = ? AND user_id = ?',
        [classroom_id, req.user.id]
      )

      if (!memberCheck) {
        return res.status(403).json({ error: 'Você não pertence a esta turma' })
      }
    }

    // Criar projeto
    const projectId = uuidv4()
    const projectData = JSON.stringify(data || {
      objects: [],
      connections: [],
      simulation: { state: 'idle', code: '' }
    })

    await dbRun(
      `INSERT INTO projects (id, name, description, user_id, classroom_id, data)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [projectId, name, description || '', req.user.id, classroom_id || null, projectData]
    )

    res.status(201).json({
      message: 'Projeto criado com sucesso',
      project: {
        id: projectId,
        name,
        description,
        user_id: req.user.id,
        classroom_id: classroom_id || null,
        data: data || {}
      }
    })

  } catch (error) {
    console.error('❌ Erro ao criar projeto:', error)
    res.status(500).json({ error: 'Erro ao criar projeto' })
  }
}

/**
 * ✅ LISTAR MEUS PROJETOS
 * GET /api/projects
 */
export async function listMyProjects(req, res) {
  try {
    const projects = await dbAll(
      `SELECT id, name, description, classroom_id, user_id, created_at, updated_at
       FROM projects
       WHERE user_id = ?
       ORDER BY updated_at DESC`,
      [req.user.id]
    )

    res.json({ projects })

  } catch (error) {
    console.error('❌ Erro ao listar projetos:', error)
    res.status(500).json({ error: 'Erro ao listar projetos' })
  }
}

/**
 * ✅ OBTER DETALHES DO PROJETO
 * GET /api/projects/:id
 */
export async function getProject(req, res) {
  try {
    const { id } = req.params

    const project = await dbGet(
      'SELECT * FROM projects WHERE id = ?',
      [id]
    )

    if (!project) {
      return res.status(404).json({ error: 'Projeto não encontrado' })
    }

    // Verificar permissão: dono ou membro da turma
    const isOwner = project.user_id === req.user.id
    const isInClassroom = project.classroom_id && await dbGet(
      'SELECT * FROM classroom_users WHERE classroom_id = ? AND user_id = ?',
      [project.classroom_id, req.user.id]
    )

    if (!isOwner && !isInClassroom) {
      return res.status(403).json({ error: 'Você não tem permissão para ver este projeto' })
    }

    // Parse do JSON
    const data = JSON.parse(project.data)

    res.json({
      project: {
        ...project,
        data
      }
    })

  } catch (error) {
    console.error('❌ Erro ao obter projeto:', error)
    res.status(500).json({ error: 'Erro ao obter projeto' })
  }
}

/**
 * ✅ EDITAR PROJETO
 * PUT /api/projects/:id
 */
export async function updateProject(req, res) {
  try {
    const { id } = req.params
    const { name, description, data } = req.body

    // Obter projeto
    const project = await dbGet(
      'SELECT * FROM projects WHERE id = ?',
      [id]
    )

    if (!project) {
      return res.status(404).json({ error: 'Projeto não encontrado' })
    }

    // Verificar se é o dono
    if (project.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Apenas o criador pode editar o projeto' })
    }

    // Atualizar
    const projectData = JSON.stringify(data || JSON.parse(project.data))
    await dbRun(
      `UPDATE projects
       SET name = ?, description = ?, data = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name || project.name, description || project.description, projectData, id]
    )

    res.json({
      message: 'Projeto atualizado com sucesso',
      project: { id, name: name || project.name, description }
    })

  } catch (error) {
    console.error('❌ Erro ao atualizar projeto:', error)
    res.status(500).json({ error: 'Erro ao atualizar projeto' })
  }
}

/**
 * ✅ DELETAR PROJETO
 * DELETE /api/projects/:id
 */
export async function deleteProject(req, res) {
  try {
    const { id } = req.params

    // Obter projeto
    const project = await dbGet(
      'SELECT * FROM projects WHERE id = ?',
      [id]
    )

    if (!project) {
      return res.status(404).json({ error: 'Projeto não encontrado' })
    }

    // Verificar se é o dono
    if (project.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Apenas o criador pode deletar o projeto' })
    }

    // Deletar
    await dbRun('DELETE FROM projects WHERE id = ?', [id])

    res.json({ message: 'Projeto deletado com sucesso' })

  } catch (error) {
    console.error('❌ Erro ao deletar projeto:', error)
    res.status(500).json({ error: 'Erro ao deletar projeto' })
  }
}

/**
 * ✅ LISTAR PROJETOS DA TURMA
 * GET /api/classrooms/:classroomId/projects
 */
export async function getClassroomProjects(req, res) {
  try {
    const { classroomId } = req.params

    // Verificar se pertence à turma
    const memberCheck = await dbGet(
      'SELECT * FROM classroom_users WHERE classroom_id = ? AND user_id = ?',
      [classroomId, req.user.id]
    )

    if (!memberCheck) {
      return res.status(403).json({ error: 'Você não pertence a esta turma' })
    }

    // Listar projetos
    const projects = await dbAll(
      `SELECT p.id, p.name, p.description, p.user_id, u.name as user_name, p.created_at, p.updated_at
       FROM projects p
       JOIN users u ON p.user_id = u.id
       WHERE p.classroom_id = ?
       ORDER BY p.updated_at DESC`,
      [classroomId]
    )

    res.json({ projects })

  } catch (error) {
    console.error('❌ Erro ao listar projetos da turma:', error)
    res.status(500).json({ error: 'Erro ao listar projetos' })
  }
}
