import { dbGet, dbRun } from '../database/init.js'

/**
 * ✅ OBTER PERFIL DO USUÁRIO
 * GET /api/users/me
 */
export async function getProfile(req, res) {
  try {
    const user = await dbGet(
      'SELECT id, name, email, role, avatar, created_at FROM users WHERE id = ?',
      [req.user.id]
    )

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    res.json({ user })

  } catch (error) {
    console.error('❌ Erro ao obter perfil:', error)
    res.status(500).json({ error: 'Erro ao obter perfil' })
  }
}

/**
 * ✅ ATUALIZAR PERFIL
 * PUT /api/users/me
 */
export async function updateProfile(req, res) {
  try {
    const { name, avatar } = req.body

    if (!name && !avatar) {
      return res.status(400).json({ error: 'Forneça dados para atualizar' })
    }

    // Atualizar
    if (name) {
      await dbRun(
        'UPDATE users SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name, req.user.id]
      )
    }

    if (avatar) {
      await dbRun(
        'UPDATE users SET avatar = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [avatar, req.user.id]
      )
    }

    const user = await dbGet(
      'SELECT id, name, email, role, avatar FROM users WHERE id = ?',
      [req.user.id]
    )

    res.json({
      message: 'Perfil atualizado com sucesso',
      user
    })

  } catch (error) {
    console.error('❌ Erro ao atualizar perfil:', error)
    res.status(500).json({ error: 'Erro ao atualizar perfil' })
  }
}
