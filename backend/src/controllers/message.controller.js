import { v4 as uuidv4 } from 'uuid'
import { dbRun, dbGet, dbAll } from '../database/init.js'

/**
 * ✅ ENVIAR MENSAGEM
 * POST /api/classrooms/:classroomId/messages
 */
export async function sendMessage(req, res) {
  try {
    const { classroomId } = req.params
    const { message } = req.body

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Mensagem não pode estar vazia' })
    }

    // Verificar se pertence à turma
    const memberCheck = await dbGet(
      'SELECT * FROM classroom_users WHERE classroom_id = ? AND user_id = ?',
      [classroomId, req.user.id]
    )

    if (!memberCheck) {
      return res.status(403).json({ error: 'Você não pertence a esta turma' })
    }

    // Criar mensagem
    const messageId = uuidv4()
    await dbRun(
      `INSERT INTO messages (id, classroom_id, user_id, message)
       VALUES (?, ?, ?, ?)`,
      [messageId, classroomId, req.user.id, message.trim()]
    )

    res.status(201).json({
      message: 'Mensagem enviada',
      msg: {
        id: messageId,
        classroom_id: classroomId,
        user_id: req.user.id,
        message: message.trim(),
        created_at: new Date()
      }
    })

  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error)
    res.status(500).json({ error: 'Erro ao enviar mensagem' })
  }
}

/**
 * ✅ LISTAR MENSAGENS DA TURMA
 * GET /api/classrooms/:classroomId/messages
 */
export async function getMessages(req, res) {
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

    // Listar mensagens
    const messages = await dbAll(
      `SELECT m.id, m.classroom_id, m.user_id, m.message, m.created_at, u.name as user_name
       FROM messages m
       JOIN users u ON m.user_id = u.id
       WHERE m.classroom_id = ?
       ORDER BY m.created_at ASC
       LIMIT 100`,
      [classroomId]
    )

    res.json({ messages })

  } catch (error) {
    console.error('❌ Erro ao listar mensagens:', error)
    res.status(500).json({ error: 'Erro ao listar mensagens' })
  }
}

/**
 * ✅ DELETAR MENSAGEM (PRÓPRIA OU PROFESSOR)
 * DELETE /api/classrooms/:classroomId/messages/:messageId
 */
export async function deleteMessage(req, res) {
  try {
    const { classroomId, messageId } = req.params

    // Obter mensagem
    const message = await dbGet(
      'SELECT * FROM messages WHERE id = ? AND classroom_id = ?',
      [messageId, classroomId]
    )

    if (!message) {
      return res.status(404).json({ error: 'Mensagem não encontrada' })
    }

    // Verificar permissão (dono ou professor)
    const classroom = await dbGet(
      'SELECT teacher_id FROM classrooms WHERE id = ?',
      [classroomId]
    )

    const isOwner = message.user_id === req.user.id
    const isTeacher = classroom.teacher_id === req.user.id

    if (!isOwner && !isTeacher) {
      return res.status(403).json({ error: 'Você não pode deletar esta mensagem' })
    }

    // Deletar
    await dbRun('DELETE FROM messages WHERE id = ?', [messageId])

    res.json({ message: 'Mensagem deletada' })

  } catch (error) {
    console.error('❌ Erro ao deletar mensagem:', error)
    res.status(500).json({ error: 'Erro ao deletar mensagem' })
  }
}
