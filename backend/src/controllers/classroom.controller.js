import { v4 as uuidv4 } from 'uuid'
import { dbRun, dbGet, dbAll } from '../database/init.js'

/**
 * Gerar código de convite (6 caracteres)
 */
function generateInviteCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * ✅ CRIAR TURMA (APENAS PROFESSOR)
 * POST /api/classrooms
 */
export async function createClassroom(req, res) {
  try {
    const { name, description, category, privacy, max_students } = req.body

    // Validar se é professor
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Apenas professores podem criar turmas' })
    }

    // Validações
    if (!name) {
      return res.status(400).json({ error: 'Nome da turma é obrigatório' })
    }

    if (name.trim().length < 3) {
      return res.status(400).json({ error: 'O nome precisa ter pelo menos 3 caracteres' })
    }

    if (name.trim().length > 100) {
      return res.status(400).json({ error: 'O nome pode ter no máximo 100 caracteres' })
    }

    const validCategories = ['Eletrônica', 'Programação', 'Robótica', 'IoT', 'Outros']
    const validPrivacy = ['public', 'private']

    const finalCategory = validCategories.includes(category) ? category : null
    const finalPrivacy = validPrivacy.includes(privacy) ? privacy : 'public'

    // Gerar código único
    let inviteCode = generateInviteCode()
    let codeExists = await dbGet('SELECT id FROM classrooms WHERE invite_code = ?', [inviteCode])
    
    while (codeExists) {
      inviteCode = generateInviteCode()
      codeExists = await dbGet('SELECT id FROM classrooms WHERE invite_code = ?', [inviteCode])
    }

    // Criar turma
    const classroomId = uuidv4()
    await dbRun(
      `INSERT INTO classrooms (id, name, description, category, privacy, teacher_id, invite_code, max_students)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [classroomId, name.trim(), description || '', finalCategory, finalPrivacy, req.user.id, inviteCode, max_students || 30]
    )

    // Adicionar professor como membro
    const memberId = uuidv4()
    await dbRun(
      `INSERT INTO classroom_users (id, classroom_id, user_id, role)
       VALUES (?, ?, ?, ?)`,
      [memberId, classroomId, req.user.id, 'teacher']
    )

    res.status(201).json({
      message: 'Turma criada com sucesso',
      classroom: {
        id: classroomId,
        name,
        description,
        teacher_id: req.user.id,
        invite_code: inviteCode,
        max_students: max_students || 30
      }
    })

  } catch (error) {
    console.error('❌ Erro ao criar turma:', error)
    res.status(500).json({ error: 'Erro ao criar turma' })
  }
}

/**
 * ✅ LISTAR MINHAS TURMAS
 * GET /api/classrooms
 */
export async function listMyClassrooms(req, res) {
  try {
    let classrooms

    if (req.user.role === 'teacher') {
      // Professor vê turmas que criou
      classrooms = await dbAll(
        `SELECT c.*, 
                (SELECT COUNT(*) FROM classroom_users WHERE classroom_id = c.id) as member_count
         FROM classrooms c
         WHERE c.teacher_id = ?
         ORDER BY c.created_at DESC`,
        [req.user.id]
      )
    } else {
      // Aluno vê turmas que entrou
      classrooms = await dbAll(
        `SELECT c.*,
                (SELECT COUNT(*) FROM classroom_users WHERE classroom_id = c.id) as member_count
         FROM classrooms c
         JOIN classroom_users cu ON c.id = cu.classroom_id
         WHERE cu.user_id = ? AND cu.role = 'student'
         ORDER BY c.created_at DESC`,
        [req.user.id]
      )
    }

    res.json({ classrooms })

  } catch (error) {
    console.error('❌ Erro ao listar turmas:', error)
    res.status(500).json({ error: 'Erro ao listar turmas' })
  }
}

/**
 * ✅ OBTER DETALHES DA TURMA
 * GET /api/classrooms/:id
 */
export async function getClassroom(req, res) {
  try {
    const { id } = req.params

    // Verificar se usuário pertence à turma
    const memberCheck = await dbGet(
      'SELECT * FROM classroom_users WHERE classroom_id = ? AND user_id = ?',
      [id, req.user.id]
    )

    if (!memberCheck) {
      return res.status(403).json({ error: 'Você não pertence a esta turma' })
    }

    // Obter turma
    const classroom = await dbGet(
      `SELECT c.*,
              (SELECT COUNT(*) FROM classroom_users WHERE classroom_id = c.id) as member_count
       FROM classrooms c
       WHERE c.id = ?`,
      [id]
    )

    if (!classroom) {
      return res.status(404).json({ error: 'Turma não encontrada' })
    }

    res.json({ classroom })

  } catch (error) {
    console.error('❌ Erro ao obter turma:', error)
    res.status(500).json({ error: 'Erro ao obter turma' })
  }
}

/**
 * ✅ ENTRAR EM TURMA COM CÓDIGO (ESTUDANTE)
 * POST /api/classrooms/join
 */
export async function joinClassroom(req, res) {
  try {
    const { invite_code } = req.body

    if (!invite_code) {
      return res.status(400).json({ error: 'Código de convite é obrigatório' })
    }

    // Buscar turma pelo código
    const classroom = await dbGet(
      'SELECT * FROM classrooms WHERE invite_code = ?',
      [invite_code]
    )

    if (!classroom) {
      return res.status(404).json({ error: 'Código de convite inválido' })
    }

    if (req.user.role === 'teacher') {
      return res.status(403).json({ error: 'Professores não podem entrar em turmas via código de convite' })
    }

    // Verificar se já está na turma
    const alreadyMember = await dbGet(
      'SELECT * FROM classroom_users WHERE classroom_id = ? AND user_id = ?',
      [classroom.id, req.user.id]
    )

    if (alreadyMember) {
      return res.status(409).json({ error: 'Você já está nesta turma' })
    }

    // Verificar limite de alunos
    const memberCount = await dbGet(
      'SELECT COUNT(*) as count FROM classroom_users WHERE classroom_id = ?',
      [classroom.id]
    )

    if (memberCount.count >= classroom.max_students) {
      return res.status(400).json({ error: 'Turma cheia' })
    }

    // Adicionar aluno à turma
    const memberId = uuidv4()
    await dbRun(
      `INSERT INTO classroom_users (id, classroom_id, user_id, role)
       VALUES (?, ?, ?, ?)`,
      [memberId, classroom.id, req.user.id, 'student']
    )

    res.status(200).json({
      message: 'Você entrou na turma com sucesso',
      classroom: {
        id: classroom.id,
        name: classroom.name,
        teacher_id: classroom.teacher_id
      }
    })

  } catch (error) {
    console.error('❌ Erro ao entrar na turma:', error)
    res.status(500).json({ error: 'Erro ao entrar na turma' })
  }
}

/**
 * ✅ LISTAR MEMBROS DA TURMA
 * GET /api/classrooms/:id/members
 */
export async function getClassroomMembers(req, res) {
  try {
    const { id } = req.params

    // Verificar se pertence à turma
    const memberCheck = await dbGet(
      'SELECT * FROM classroom_users WHERE classroom_id = ? AND user_id = ?',
      [id, req.user.id]
    )

    if (!memberCheck) {
      return res.status(403).json({ error: 'Você não pertence a esta turma' })
    }

    // Listar membros
    const members = await dbAll(
      `SELECT u.id, u.name, u.email, cu.role, cu.joined_at
       FROM classroom_users cu
       JOIN users u ON cu.user_id = u.id
       WHERE cu.classroom_id = ?
       ORDER BY cu.role DESC, u.name ASC`,
      [id]
    )

    res.json({ members })

  } catch (error) {
    console.error('❌ Erro ao listar membros:', error)
    res.status(500).json({ error: 'Erro ao listar membros' })
  }
}

/**
 * ✅ DELETAR TURMA (APENAS PROFESSOR)
 * DELETE /api/classrooms/:id
 */
export async function deleteClassroom(req, res) {
  try {
    const { id } = req.params

    // Verificar se é o professor
    const classroom = await dbGet(
      'SELECT * FROM classrooms WHERE id = ?',
      [id]
    )

    if (!classroom) {
      return res.status(404).json({ error: 'Turma não encontrada' })
    }

    if (classroom.teacher_id !== req.user.id) {
      return res.status(403).json({ error: 'Apenas o professor pode deletar a turma' })
    }

    // Deletar turma (cascata automática)
    await dbRun('DELETE FROM classrooms WHERE id = ?', [id])

    res.json({ message: 'Turma deletada com sucesso' })

  } catch (error) {
    console.error('❌ Erro ao deletar turma:', error)
    res.status(500).json({ error: 'Erro ao deletar turma' })
  }
}

/**
 * ✅ REMOVER MEMBRO DA TURMA (PROFESSOR)
 * DELETE /api/classrooms/:id/members/:userId
 */
export async function removeClassroomMember(req, res) {
  try {
    const { id, userId } = req.params

    // Verificar se é o professor
    const classroom = await dbGet(
      'SELECT * FROM classrooms WHERE id = ?',
      [id]
    )

    if (!classroom) {
      return res.status(404).json({ error: 'Turma não encontrada' })
    }

    if (classroom.teacher_id !== req.user.id) {
      return res.status(403).json({ error: 'Apenas o professor pode remover membros' })
    }

    // Não permitir remover o professor
    if (userId === classroom.teacher_id) {
      return res.status(400).json({ error: 'Não pode remover o professor da turma' })
    }

    // Remover membro
    await dbRun(
      'DELETE FROM classroom_users WHERE classroom_id = ? AND user_id = ?',
      [id, userId]
    )

    res.json({ message: 'Membro removido da turma' })

  } catch (error) {
    console.error('❌ Erro ao remover membro:', error)
    res.status(500).json({ error: 'Erro ao remover membro' })
  }
}

/**
 * ✅ SAIR DA TURMA (ALUNO)
 * DELETE /api/classrooms/:id/leave
 */
export async function leaveClassroom(req, res) {
  try {
    const { id } = req.params

    const membership = await dbGet(
      'SELECT * FROM classroom_users WHERE classroom_id = ? AND user_id = ?',
      [id, req.user.id]
    )

    if (!membership) {
      return res.status(404).json({ error: 'Você não está nesta turma' })
    }

    if (membership.role === 'teacher') {
      return res.status(403).json({ error: 'Professor não pode sair da turma' })
    }

    await dbRun('DELETE FROM classroom_users WHERE id = ?', [membership.id])

    res.json({ message: 'Você saiu da turma com sucesso' })
  } catch (error) {
    console.error('❌ Erro ao sair da turma:', error)
    res.status(500).json({ error: 'Erro ao sair da turma' })
  }
}
