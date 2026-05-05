import React, { useState } from 'react'
import { useProject } from '../context/ProjectContext'
import '../styles/LoginScreen.css'

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true) // Começar no login
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    profileImage: null
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { login } = useProject()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Limpar erro do campo quando usuário começa a digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, profileImage: 'Imagem muito grande (máx. 5MB)' }))
        return
      }
      // Validar tipo
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, profileImage: 'Arquivo deve ser uma imagem' }))
        return
      }
      setFormData(prev => ({ ...prev, profileImage: file }))
      setErrors(prev => ({ ...prev, profileImage: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!isLogin) {
      // Validações do registro
      if (!formData.name.trim()) {
        newErrors.name = 'Informe seu nome'
      } else if (formData.name.trim().length < 3) {
        newErrors.name = 'O nome deve ter pelo menos 3 caracteres'
      } else if (formData.name.trim().length > 100) {
        newErrors.name = 'O nome pode ter no máximo 100 caracteres'
      }

      if (!formData.email.trim()) {
        newErrors.email = 'Informe seu email'
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
          newErrors.email = 'Email inválido'
        }
      }

      if (!formData.password) {
        newErrors.password = 'Informe sua senha'
      } else if (formData.password.length < 6) {
        newErrors.password = 'A senha deve ter pelo menos 6 caracteres'
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirme sua senha'
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'As senhas não coincidem'
      }

      if (!formData.role) {
        newErrors.role = 'Selecione um tipo de conta'
      }
    } else {
      // Validações do login
      if (!formData.email.trim()) {
        newErrors.email = 'Informe seu email'
      }

      if (!formData.password) {
        newErrors.password = 'Informe sua senha'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)

    try {
      if (isLogin) {
        // LOGIN
        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        })

        const data = await response.json()
        if (!response.ok) throw new Error(data.error)

        // Salvar token e dados do usuário
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        login(data.user)

      } else {
        // REGISTRO
        const response = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim(),
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            role: formData.role
          })
        })

        const data = await response.json()
        if (!response.ok) {
          if (data.error.includes('email')) {
            setErrors({ email: 'Este email já está em uso' })
          } else {
            throw new Error(data.error)
          }
          return
        }

        // Salvar token e dados do usuário
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        login(data.user)
      }
    } catch (err) {
      setErrors({ general: err.message })
    } finally {
      setLoading(false)
    }
  }

  const switchToLogin = () => {
    setIsLogin(true)
    setErrors({})
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: ''
    })
  }

  const switchToRegister = () => {
    setIsLogin(false)
    setErrors({})
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: ''
    })
  }

  return (
    <div className="login-container">
      {/* Painel esquerdo - Identidade visual */}
      <div className="login-left-panel">
        <div className="brand-section">
          <div className="brand-logo">
            <div className="logo-icon">⚡</div>
            <h1>VolTix</h1>
          </div>
          <p className="brand-tagline">IoT Visual Editor</p>
        </div>

        <div className="illustration-section">
          <div className="circuit-illustration">
            <div className="circuit-node node-1"></div>
            <div className="circuit-node node-2"></div>
            <div className="circuit-node node-3"></div>
            <div className="circuit-connection conn-1"></div>
            <div className="circuit-connection conn-2"></div>
            <div className="circuit-connection conn-3"></div>
          </div>
        </div>

        <div className="features-section">
          <div className="feature-item">
            <div className="feature-icon">🏫</div>
            <div className="feature-content">
              <h3>Turmas Colaborativas</h3>
              <p>Organize alunos e projetos em ambientes educacionais estruturados</p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon">💬</div>
            <div className="feature-content">
              <h3>Chat em Tempo Real</h3>
              <p>Comunique-se instantaneamente com toda a turma durante projetos</p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon">🖼️</div>
            <div className="feature-content">
              <h3>Galeria de Projetos</h3>
              <p>Explore e compartilhe circuitos e simulações IoT criadas pela comunidade</p>
            </div>
          </div>
        </div>
      </div>

      {/* Painel direito - Autenticação */}
      <div className="login-right-panel">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Bem-vindo ao VolTix</h2>
            <p>Entre na sua conta ou crie uma nova para começar</p>
          </div>

          <div className="auth-tabs">
            <button
              className={`auth-tab ${isLogin ? 'active' : ''}`}
              onClick={switchToLogin}
            >
              Entrar
            </button>
            <button
              className={`auth-tab ${!isLogin ? 'active' : ''}`}
              onClick={switchToRegister}
            >
              Criar conta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {isLogin ? (
              // Formulário de Login
              <>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="field-error">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Senha</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Digite sua senha"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={errors.password ? 'error' : ''}
                  />
                  {errors.password && <span className="field-error">{errors.password}</span>}
                </div>
              </>
            ) : (
              // Formulário de Registro
              <>
                <div className="form-group">
                  <label className="form-label">Nome completo</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Ex: João Silva"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={errors.name ? 'error' : ''}
                  />
                  {errors.name && <span className="field-error">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Foto de perfil</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className={errors.profileImage ? 'error' : ''}
                  />
                  {errors.profileImage && <span className="field-error">{errors.profileImage}</span>}
                  <small className="field-hint">Formato: JPG, PNG ou GIF. Tamanho máximo: 5MB</small>
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Ex: joao@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="field-error">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Senha</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Digite sua senha"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={errors.password ? 'error' : ''}
                  />
                  {errors.password && <span className="field-error">{errors.password}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Confirmar senha</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Repita sua senha"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={errors.confirmPassword ? 'error' : ''}
                  />
                  {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Tipo de conta</label>
                  <div className="role-selection">
                    <button
                      type="button"
                      className={`role-btn ${formData.role === 'student' ? 'selected' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, role: 'student' }))}
                    >
                      <div className="role-icon">🎓</div>
                      <div className="role-label">Estudante</div>
                    </button>
                    <button
                      type="button"
                      className={`role-btn ${formData.role === 'teacher' ? 'selected' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, role: 'teacher' }))}
                    >
                      <div className="role-icon">👨‍🏫</div>
                      <div className="role-label">Professor</div>
                    </button>
                  </div>
                  {errors.role && <span className="field-error">{errors.role}</span>}
                </div>
              </>
            )}

            {errors.general && <div className="error-message">{errors.general}</div>}

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Carregando...' : (isLogin ? 'Entrar na conta' : 'Criar conta')}
            </button>

            <div className="auth-switch">
              <span>{isLogin ? 'Não tem conta?' : 'Já tem conta?'}</span>
              <button
                type="button"
                onClick={isLogin ? switchToRegister : switchToLogin}
                className="switch-link"
              >
                {isLogin ? 'Criar conta' : 'Entrar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}