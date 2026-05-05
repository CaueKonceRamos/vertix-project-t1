import React, { useState } from 'react'
import { useProject } from './context/ProjectContext'
import LoginScreen from './components/LoginScreen'
import DashboardScreen from './components/ProjectsScreen'
import GalleryScreen from './components/GalleryScreen'
import MyProjectsScreen from './components/MyProjectsScreen'
import ClassroomScreen from './components/ClassroomScreen'
import Editor from './components/Editor'
import './styles/App.css'

function App() {
  const { currentUser, currentProject } = useProject()
  const [currentScreen, setCurrentScreen] = useState('dashboard')

  if (!currentUser) {
    return <LoginScreen />
  }

  if (currentProject) {
    return <Editor />
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <DashboardScreen onNavigate={setCurrentScreen} />
      case 'gallery':
        return <GalleryScreen onNavigate={setCurrentScreen} />
      case 'my-projects':
        return <MyProjectsScreen onNavigate={setCurrentScreen} />
      case 'classroom':
        return <ClassroomScreen onNavigate={setCurrentScreen} />
      default:
        return <DashboardScreen onNavigate={setCurrentScreen} />
    }
  }

  return (
    <div className="app">
      {renderScreen()}
    </div>
  )
}

export default App
