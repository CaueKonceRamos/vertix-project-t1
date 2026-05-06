import React, { useState } from 'react'
import { useProject } from '../context/ProjectContext'
import '../styles/DashboardScreen.css'

export default function DashboardLayout({ onNavigate, activeItem, children }) {
  const { currentUser, logout } = useProject()
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">⚡</span>
            <span className="logo-text">VolTix</span>
          </div>
        </div>

        <div className="header-center" />

        <div className="header-right">
          <div className="user-profile" onClick={() => setShowProfileMenu((prev) => !prev)}>
            <img src="/api/placeholder/32/32" alt="Avatar" className="user-avatar" />
            <div className="user-info">
              <span className="user-name">{currentUser?.name}</span>
              <span className="user-role">{currentUser?.role === 'teacher' ? 'Professor' : 'Estudante'}</span>
            </div>
          </div>
          {showProfileMenu && (
            <div className="profile-dropdown">
              <button type="button" className="dropdown-item" onClick={() => alert('Editar perfil ainda não implementado')}>
                Editar perfil
              </button>
              <button type="button" className="dropdown-item" onClick={logout}>
                Sair da Conta
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="dashboard-main">
        <aside className="dashboard-sidebar">
          <nav className="sidebar-nav">
            <div className="nav-section">
              <button
                className={`nav-item ${activeItem === 'dashboard' ? 'active' : ''}`}
                onClick={() => onNavigate('dashboard')}
              >
                Início
              </button>
              <button
                className={`nav-item ${activeItem === 'my-projects' ? 'active' : ''}`}
                onClick={() => onNavigate('my-projects')}
              >
                Meus Projetos
              </button>
              <button
                className={`nav-item ${activeItem === 'classroom' ? 'active' : ''}`}
                onClick={() => onNavigate('classroom')}
              >
                Turmas
              </button>
            </div>

            <div className="nav-section quick-actions">
              <h3>Ações Rápidas</h3>
              <button className="quick-action-btn" onClick={() => onNavigate('my-projects')}>
                Criar projeto
              </button>
              <button className="quick-action-btn" onClick={() => onNavigate('classroom')}>
                Minhas turmas
              </button>
            </div>

            <div className="nav-section user-actions">
              <button className="logout-btn" onClick={logout}>
                🚪 Sair da Conta
              </button>
            </div>
          </nav>
        </aside>

        <main className="dashboard-content-area">{children}</main>
      </div>

      <footer className="dashboard-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="logo-icon">⚡</span>
              <span className="logo-text">VolTix</span>
            </div>
            <p>Plataforma de simulação e prototipagem desenvolvida no contexto da disciplina de Internet das Coisas (IoT).</p>
          </div>

          <div className="footer-links">
            <div className="footer-section">
              <h4>Navegação</h4>
              <ul>
                <li><button type="button" className="footer-link" onClick={() => onNavigate('dashboard')}>Início</button></li>
                <li><button type="button" className="footer-link" onClick={() => onNavigate('classroom')}>Turmas</button></li>
                <li><button type="button" className="footer-link" onClick={() => onNavigate('my-projects')}>Projetos</button></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Recursos</h4>
              <ul>
                <li><span className="footer-link">Tutoriais</span></li>
                <li><span className="footer-link">Ajuda</span></li>
                <li><span className="footer-link">Suporte</span></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
