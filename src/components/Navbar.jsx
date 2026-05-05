import React from 'react'
import { useProject } from '../context/ProjectContext'
import '../styles/Navbar.css'

export default function Navbar() {
  const { currentProject, currentUser, saveProject } = useProject()

  return (
    <nav className="editor-navbar">
      <div className="navbar-left">
        <h2>⚡ Voltix</h2>
        <div className="project-info">
          <span className="project-name">{currentProject?.name}</span>
          <span className="user-name">por {currentUser?.name}</span>
        </div>
      </div>

      <div className="navbar-actions">
        <button className="save-btn" onClick={saveProject} title="Salvar projeto">
          💾 Salvar
        </button>
      </div>
    </nav>
  )
}
