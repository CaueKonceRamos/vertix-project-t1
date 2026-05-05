import React, { useRef, useState, useEffect } from 'react'
import { useProject } from '../context/ProjectContext'
import CanvasObject from './CanvasObject'
import '../styles/Canvas.css'

const ACTUATOR_TYPES = ['led', 'buzzer', 'servo', 'lcd', 'esp32']
const SENSOR_TYPES = ['ultrasonic', 'ldr', 'button']

export default function Canvas({ isDraggingFromLibrary }) {
  const canvasRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [gridVisible, setGridVisible] = useState(true)
  const [connectingFrom, setConnectingFrom] = useState(null)

  const {
    objects,
    connections,
    addObject,
    addConnection,
    updateObject,
    selectedObject,
    setSelectedObject,
    isSimulating
  } = useProject()

  // Drag and drop de itens da biblioteca
  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  const handleDrop = (e) => {
    e.preventDefault()

    if (!isDraggingFromLibrary) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    addObject(isDraggingFromLibrary, { x, y })
  }

  // Manipulação de objetos no canvas
  const handleObjectMouseDown = (e, objectId) => {
    if (isSimulating || connectingFrom) return
    if (e.target.closest('button')) return

    e.stopPropagation()
    setSelectedObject(objectId)
    setIsDragging(true)

    const rect = canvasRef.current.getBoundingClientRect()
    const obj = objects.find(o => o.id === objectId)

    setDragOffset({
      x: e.clientX - rect.left - obj.position.x,
      y: e.clientY - rect.top - obj.position.y
    })
  }

  const moveSelectedObject = (clientX, clientY) => {
    if (!selectedObject || !isDragging) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = Math.round((clientX - rect.left - dragOffset.x) / 10) * 10
    const y = Math.round((clientY - rect.top - dragOffset.y) / 10) * 10

    updateObject(selectedObject, { position: { x, y } })
  }

  const handleMouseMove = (e) => {
    if (!isDragging || !selectedObject) return
    moveSelectedObject(e.clientX, e.clientY)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleCanvasClick = (e) => {
    if (e.target === canvasRef.current) {
      setSelectedObject(null)
      setConnectingFrom(null)
    }
  }

  const connectToObject = (targetId) => {
    if (!connectingFrom || connectingFrom === targetId) {
      setConnectingFrom(null)
      return
    }

    addConnection(connectingFrom, targetId)
    setConnectingFrom(null)
  }

  const getObjectCenter = (obj) => ({
    x: obj.position.x + 30,
    y: obj.position.y + 30
  })

  const getConnectionColor = (fromType, toType) => {
    if (ACTUATOR_TYPES.includes(fromType) || ACTUATOR_TYPES.includes(toType)) {
      return '#ef4444'
    }
    if (SENSOR_TYPES.includes(fromType) || SENSOR_TYPES.includes(toType)) {
      return '#3b82f6'
    }
    return '#f59e0b'
  }

  const renderConnectionLines = () => {
    if (!connections.length) return null

    return (
      <svg className="connection-layer">
        {connections.map(conn => {
          const fromId = String(conn.from).split('.')[0]
          const toId = String(conn.to).split('.')[0]
          const fromObj = objects.find(obj => obj.id === fromId)
          const toObj = objects.find(obj => obj.id === toId)

          if (!fromObj || !toObj) return null

          const fromCenter = getObjectCenter(fromObj)
          const toCenter = getObjectCenter(toObj)
          const color = getConnectionColor(fromObj.type, toObj.type)

          return (
            <line
              key={conn.id}
              x1={fromCenter.x}
              y1={fromCenter.y}
              x2={toCenter.x}
              y2={toCenter.y}
              stroke={color}
              strokeWidth="4"
              strokeLinecap="round"
              className="connection-line"
            />
          )
        })}
      </svg>
    )
  }

  useEffect(() => {
    if (!isDragging || !selectedObject) return

    const handleWindowMove = (e) => {
      moveSelectedObject(e.clientX, e.clientY)
    }

    const handleWindowUp = () => {
      setIsDragging(false)
    }

    window.addEventListener('mousemove', handleWindowMove)
    window.addEventListener('mouseup', handleWindowUp)

    return () => {
      window.removeEventListener('mousemove', handleWindowMove)
      window.removeEventListener('mouseup', handleWindowUp)
    }
  }, [isDragging, selectedObject, dragOffset, updateObject])

  return (
    <div
      ref={canvasRef}
      className="canvas"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleCanvasClick}
      style={{
        backgroundImage: gridVisible ? 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cline x1=\'0\' y1=\'0\' x2=\'20\' y2=\'0\' stroke=\'%23e0e0e0\' stroke-width=\'0.5\'/%3E%3Cline x1=\'0\' y1=\'0\' x2=\'0\' y2=\'20\' stroke=\'%23e0e0e0\' stroke-width=\'0.5\'/%3E%3C/svg%3E")' : 'none',
        backgroundSize: '20px 20px'
      }}
    >
      <div className="canvas-content">
        {renderConnectionLines()}
        {objects.map(obj => (
          <CanvasObject
            key={obj.id}
            object={obj}
            isSelected={selectedObject === obj.id}
            isConnecting={connectingFrom === obj.id}
            onMouseDown={(e) => handleObjectMouseDown(e, obj.id)}
            onClick={(e) => {
              e.stopPropagation()
              if (connectingFrom) {
                connectToObject(obj.id)
              }
            }}
            onStartConnect={() => {
              setConnectingFrom(obj.id)
              setSelectedObject(obj.id)
            }}
          />
        ))}
      </div>

      {connectingFrom && (
        <div className="canvas-connection-status">
          Conexão ativa: clique em outro componente para conectar ao objeto selecionado.
        </div>
      )}

      {objects.length === 0 && (
        <div className="canvas-empty">
          <p>Arraste itens da biblioteca para começar</p>
        </div>
      )}
    </div>
  )
}
