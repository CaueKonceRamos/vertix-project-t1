import React, { useState } from 'react'
import '../styles/Sidebar.css'

const LIBRARY_ITEMS = {
  Base: [
    {
      name: 'Arduino Uno',
      type: 'arduino',
      icon: '/icons/arduino_uno.png',
      description: 'Microcontrolador central do projeto'
    },
    {
      name: 'Protoboard',
      type: 'protoboard',
      icon: '/icons/protoboard.png',
      description: 'Distribui energia e conecta componentes'
    }
  ],
  Conexões: [
    {
      name: 'Jumper Wires',
      type: 'jumper',
      icon: '/icons/jumper_wires.png',
      description: 'Fios para interligar Arduino, sensores e atuadores'
    },
    {
      name: 'Resistor',
      type: 'resistor',
      icon: '/icons/resistor.png',
      description: 'Proteção em série para LEDs e sensores'
    }
  ],
  Atuadores: [
    {
      name: 'LED',
      type: 'led',
      icon: '/icons/led.png',
      description: 'Sinal visual acionado por pinos digitais'
    },
    {
      name: 'Buzzer',
      type: 'buzzer',
      icon: '/icons/buzzer.png',
      description: 'Saída sonora para alarmes e feedback'
    },
    {
      name: 'Servo Motor',
      type: 'servo',
      icon: '/icons/servo_motor.png',
      description: 'Atuador de posição com controle PWM'
    }
  ],
  Sensores: [
    {
      name: 'Sensor Ultrassônico',
      type: 'ultrasonic',
      icon: '/icons/sersor_hc-sr04.png',
      description: 'Mede distância com TRIG e ECHO'
    },
    {
      name: 'LDR',
      type: 'ldr',
      icon: '/icons/ldr.png',
      description: 'Sensor de luz usado em divisor de tensão'
    },
    {
      name: 'Botão Push',
      type: 'button',
      icon: '/icons/botao_push_button.png',
      description: 'Entrada digital para controle manual'
    }
  ],
  Interface: [
    {
      name: 'LCD 16x2',
      type: 'lcd',
      icon: '/icons/display_lcd.png',
      description: 'Interface visual para status e dados'
    }
  ],
  IoT: [
    {
      name: 'ESP32',
      type: 'esp32',
      icon: '/icons/esp32.png',
      description: 'Módulo Wi-Fi para projetos IoT reais'
    }
  ]
}

export default function Sidebar({ setIsDraggingFromLibrary }) {
  const [expandedCategory, setExpandedCategory] = useState('Base')

  const handleDragStart = (item) => {
    setIsDraggingFromLibrary(item.type)
  }

  const handleDragEnd = () => {
    setIsDraggingFromLibrary(null)
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>📚 Biblioteca</h3>
      </div>

      <div className="library-categories">
        {Object.entries(LIBRARY_ITEMS).map(([category, items]) => (
          <div key={category} className="category">
            <button
              className={`category-header ${expandedCategory === category ? 'expanded' : ''}`}
              onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
            >
              <span>{category}</span>
              <span className="icon">▸</span>
            </button>

            {expandedCategory === category && (
              <div className="library-items">
                {items.map(item => (
                  <div
                    key={item.type}
                    className="library-item"
                    draggable
                    title={item.description}
                    onDragStart={() => handleDragStart(item)}
                    onDragEnd={handleDragEnd}
                  >
                    <span className="item-icon">
                      <img src={item.icon} alt={item.name} />
                    </span>
                    <span className="item-name">{item.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  )
}
