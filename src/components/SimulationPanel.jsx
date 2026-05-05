import React from 'react'
import { useProject } from '../context/ProjectContext'
import Simulation3D from './Simulation3D'
import '../styles/SimulationPanel.css'

export default function SimulationPanel() {
  const { isSimulating, objects, connections, stopSimulation } = useProject()

  if (!isSimulating) return null

  return (
    <div className="simulation-overlay">
      <div className="simulation-panel">
        <div className="simulation-header">
          <div>
            <h3>🎮 Simulação 3D</h3>
            <p>Renderizando o layout do projetado pelo usuário</p>
          </div>
          <button className="simulation-close-btn" onClick={stopSimulation}>
            ✕ Fechar
          </button>
        </div>

        <div className="simulation-view">
          <Simulation3D objects={objects} connections={connections} />
        </div>
      </div>
    </div>
  )
}
