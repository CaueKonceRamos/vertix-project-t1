import React, { useState } from 'react'
import { useProject } from '../context/ProjectContext'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import Canvas from './Canvas'
import Toolbar from './Toolbar'
import SimulationPanel from './SimulationPanel'
import Footer from './Footer'
import '../styles/Editor.css'

export default function Editor() {
  const [isDraggingFromLibrary, setIsDraggingFromLibrary] = useState(null)
  const { currentProject } = useProject()

  return (
    <div className="editor-container">
      <Navbar />
      <div className="editor-main">
        <Sidebar setIsDraggingFromLibrary={setIsDraggingFromLibrary} />
        <div className="editor-workspace">
          <Toolbar />
          <Canvas isDraggingFromLibrary={isDraggingFromLibrary} />
        </div>
      </div>
      <SimulationPanel />
      <Footer />
    </div>
  )
}
