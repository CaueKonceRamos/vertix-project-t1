import React from 'react'
import { useProject } from '../context/ProjectContext'
import '../styles/CanvasObject.css'

const OBJECT_ICON_SOURCES = {
  arduino: '/icons/arduino_uno.png',
  protoboard: '/icons/protoboard.png',
  jumper: '/icons/jumper_wires.png',
  resistor: '/icons/resistor.png',
  led: '/icons/led.png',
  buzzer: '/icons/buzzer.png',
  servo: '/icons/servo_motor.png',
  ultrasonic: '/icons/sersor_hc-sr04.png',
  ldr: '/icons/ldr.png',
  button: '/icons/botao_push_button.png',
  lcd: '/icons/display_lcd.png',
  esp32: '/icons/esp32.png'
}

const OBJECT_ICON_FALLBACK = {
  cube: '📦',
  sphere: '⚪',
  cylinder: '🥫',
  cone: '🔻'
}

export default function CanvasObject({ object, isSelected, onMouseDown, onClick, onStartConnect, isConnecting }) {
  const { updateObject, deleteObject, isSimulating } = useProject()

  const handleDelete = (e) => {
    e.stopPropagation()
    deleteObject(object.id)
  }

  const handleRotate = (e) => {
    e.stopPropagation()
    if (isSimulating) return
    updateObject(object.id, {
      rotation: (object.rotation + 15) % 360
    })
  }

  const handleScale = (e) => {
    e.stopPropagation()
    if (isSimulating) return
    const newScale = Math.min(2, object.scale + 0.1)
    updateObject(object.id, { scale: newScale })
  }

  const iconSrc = OBJECT_ICON_SOURCES[object.type]
  const fallbackIcon = OBJECT_ICON_FALLBACK[object.type] || '📦'

  return (
    <div
      className={`canvas-object ${isSelected ? 'selected' : ''} ${isSimulating ? 'simulating' : ''} ${isConnecting ? 'connecting' : ''}`}
      style={{
        left: object.position.x,
        top: object.position.y,
        transform: `rotate(${object.rotation}deg) scale(${object.scale})`,
        cursor: isSimulating ? 'default' : 'grab'
      }}
      onMouseDown={onMouseDown}
      onClick={onClick}
    >
      <div className="object-icon">
        {iconSrc ? <img src={iconSrc} alt={object.type} /> : fallbackIcon}
      </div>

      {isSelected && !isSimulating && (
        <div className="object-controls">
          <button 
            className="control-btn rotate-btn"
            onClick={handleRotate}
            title="Rotacionar (15°)"
          >
            🔄
          </button>
          <button
            className="control-btn scale-btn"
            onClick={handleScale}
            title="Aumentar tamanho"
          >
            ↔️
          </button>
          <button
            className="control-btn connect-btn"
            onClick={(e) => {
              e.stopPropagation()
              onStartConnect?.()
            }}
            title="Iniciar conexão"
          >
            🔌
          </button>
          <button
            className="control-btn delete-btn"
            onClick={handleDelete}
            title="Deletar"
          >
            🗑️
          </button>
        </div>
      )}

      {isSelected && (
        <div className="selection-box"></div>
      )}
    </div>
  )
}
