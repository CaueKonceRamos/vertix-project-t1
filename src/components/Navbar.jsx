import React from 'react'
import { useProject } from '../context/ProjectContext'
import '../styles/Navbar.css'

export default function Navbar() {
  const { currentProject, currentUser, saveCurrentProject, closeProject } = useProject()

  return (
    <nav className="editor-navbar">
      <div className="navbar-left">
        <div className="brand-block">
          <h2>⚡ VolTix</h2>
          <span className="editor-title">Editor de Projeto</span>
        </div>
        <div className="project-info">
          <span className="project-name">{currentProject?.name}</span>
          <span className="project-meta">por {currentUser?.name}</span>
        </div>
      </div>

      <div className="navbar-actions">
        <button className="exit-project-btn" onClick={closeProject} title="Sair do projeto">
          ✕ Sair do projeto
        </button>
        <button className="save-btn" onClick={saveCurrentProject} title="Salvar projeto">
          💾 Salvar
        </button>
      </div>
    </nav>
  )
}
