import React, { useState } from 'react'
import { API_BASE } from '../utils/api.js'
import '../styles/ProfileEditModal.css'

export default function ProfileEditModal({ isOpen, user, onClose, onSave }) {
  const [name, setName] = useState(user?.name || '')
  const [avatar, setAvatar] = useState(user?.avatar || '')
  const [avatarFile, setAvatarFile] = useState(null)
  const [preview, setPreview] = useState(user?.avatar || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('Imagem muito grande (máx. 5MB)')
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('Arquivo deve ser uma imagem')
      return
    }

    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target.result)
      setAvatar(e.target.result)
    }
    reader.readAsDataURL(file)
    setError('')
  }

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Nome é obrigatório')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE}/api/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: name.trim(),
          ...(avatar && { avatar })
        })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      localStorage.setItem('user', JSON.stringify(data.user))
      onSave(data.user)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-profile" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-profile">
          <h3>Editar Perfil</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="profile-form">
          <div className="profile-avatar-section">
            <div className="avatar-preview">
              {preview ? (
                <img src={preview} alt="Avatar" />
              ) : (
                <div className="avatar-placeholder">👤</div>
              )}
            </div>
            <label className="avatar-upload">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={loading}
              />
              <span>Mudar foto</span>
            </label>
          </div>

          <div className="form-group-profile">
            <label>Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
              disabled={loading}
            />
          </div>

          {error && <div className="error-message-profile">{error}</div>}

          <div className="modal-actions-profile">
            <button
              className="btn-secondary-profile"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              className="btn-primary-profile"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
