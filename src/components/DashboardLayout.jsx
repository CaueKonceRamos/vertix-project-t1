import React, { useState } from 'react'
import { useProject } from '../context/ProjectContext'
import ProfileEditModal from './ProfileEditModal'
import '../styles/DashboardScreen.css'
import Footer from './Footer'

export default function DashboardLayout({ onNavigate, activeItem, children }) {
  const { currentUser, logout, updateUserProfile } = useProject()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const handleEditProfile = () => {
    setShowProfileMenu(false)
    setShowEditModal(true)
  }

  const handleSaveProfile = (updatedUser) => {
    updateUserProfile(updatedUser)
  }

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
              <button type="button" className="dropdown-item" onClick={handleEditProfile}>
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

          </nav>
        </aside>

        <main className="dashboard-content-area">{children}</main>
      </div>
      <ProfileEditModal 
        isOpen={showEditModal} 
        user={currentUser} 
        onClose={() => setShowEditModal(false)} 
        onSave={handleSaveProfile}
      />
      <Footer />
    </div>
  )
}
