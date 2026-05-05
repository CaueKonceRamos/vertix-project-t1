import React from 'react'
import { useProject } from '../context/ProjectContext'
import '../styles/Toolbar.css'

export default function Toolbar() {
  const {
    selectedObject,
    deleteObject,
    isSimulating,
    startSimulation,
    stopSimulation
  } = useProject()

  const handleDelete = () => {
    if (selectedObject) {
      deleteObject(selectedObject)
    }
  }

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <button
          className="toolbar-btn"
          disabled={!selectedObject || isSimulating}
          onClick={handleDelete}
          title="Deletar objeto selecionado"
        >
          🗑️ Deletar
        </button>
      </div>

      <div className="toolbar-section">
        <button
          className={`toolbar-btn simulation-btn ${isSimulating ? 'active' : ''}`}
          onClick={isSimulating ? stopSimulation : startSimulation}
          title={isSimulating ? 'Parar simulação' : 'Iniciar simulação'}
        >
          {isSimulating ? '⏹️ Parar' : '▶️ Simular'}
        </button>
      </div>

      <div className="toolbar-section">
        <span className="toolbar-info">
          {selectedObject ? 'Objeto selecionado' : 'Nenhum objeto selecionado'}
        </span>
      </div>
    </div>
  )
}
