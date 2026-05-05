import React, { createContext, useState, useCallback, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

export const ProjectContext = createContext()

export const ProjectProvider = ({ children }) => {
  // Estado global
  const [currentUser, setCurrentUser] = useState(null)
  const [projects, setProjects] = useState([])
  const [currentProject, setCurrentProject] = useState(null)
  const [objects, setObjects] = useState([])
  const [selectedObject, setSelectedObject] = useState(null)
  const [connections, setConnections] = useState([])
  const [isSimulating, setIsSimulating] = useState(false)
  const [classrooms, setClassrooms] = useState([])
  const [currentClassroom, setCurrentClassroom] = useState(null)

  // Helper para headers com token
  const getHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  }

  // ========== USUÁRIO ==========
  const login = useCallback((user) => {
    setCurrentUser(user)
  }, [])

  const logout = useCallback(() => {
    setCurrentUser(null)
    setCurrentProject(null)
    setObjects([])
    setConnections([])
    setClassrooms([])
    setCurrentClassroom(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }, [])

  // Carregar dados do usuário logado
  const loadUserData = useCallback(async () => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')

    if (token && user) {
      try {
        const userData = JSON.parse(user)
        setCurrentUser(userData)

        // Carregar projetos
        await loadProjects()

        // Carregar turmas
        await loadClassrooms()
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error)
        logout()
      }
    }
  }, [])

  // ========== PROJETOS ==========
  const loadProjects = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/projects', {
        headers: getHeaders()
      })

      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects || [])
      }
    } catch (error) {
      console.error('Erro ao carregar projetos:', error)
    }
  }, [])

  const createProject = useCallback(async (projectName, classroomId = null) => {
    try {
      const response = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          name: projectName,
          classroom_id: classroomId,
          data: { objects: [], connections: [] }
        })
      })

      if (response.ok) {
        const data = await response.json()
        await loadProjects() // Recarregar lista
        return data.project
      }
    } catch (error) {
      console.error('Erro ao criar projeto:', error)
    }
    return null
  }, [loadProjects])

  const openProject = useCallback(async (projectId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
        headers: getHeaders()
      })

      if (response.ok) {
        const data = await response.json()
        const project = data.project
        setCurrentProject(project)
        setObjects(project.data.objects || [])
        setConnections(project.data.connections || [])
        setSelectedObject(null)
      }
    } catch (error) {
      console.error('Erro ao abrir projeto:', error)
    }
  }, [])

  const saveCurrentProject = useCallback(async () => {
    if (!currentProject) return

    try {
      const updatedData = { objects, connections }
      const response = await fetch(`http://localhost:5000/api/projects/${currentProject.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ data: updatedData })
      })

      if (response.ok) {
        setCurrentProject(prev => ({ ...prev, data: updatedData }))
      }
    } catch (error) {
      console.error('Erro ao salvar projeto:', error)
    }
  }, [currentProject, objects, connections])

  const deleteProject = useCallback(async (projectId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: getHeaders()
      })

      if (response.ok) {
        await loadProjects()
        if (currentProject?.id === projectId) {
          setCurrentProject(null)
          setObjects([])
          setConnections([])
        }
      }
    } catch (error) {
      console.error('Erro ao deletar projeto:', error)
    }
  }, [currentProject, loadProjects])

  // ========== TURMAS ==========
  const loadClassrooms = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/classrooms', {
        headers: getHeaders()
      })

      if (response.ok) {
        const data = await response.json()
        setClassrooms(data.classrooms || [])
      }
    } catch (error) {
      console.error('Erro ao carregar turmas:', error)
    }
  }, [])

  const createClassroom = useCallback(async (name, description = '', category = null, privacy = 'public') => {
    try {
      const response = await fetch('http://localhost:5000/api/classrooms', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name, description, category, privacy })
      })

      if (response.ok) {
        const data = await response.json()
        await loadClassrooms()
        return data.classroom
      }
    } catch (error) {
      console.error('Erro ao criar turma:', error)
    }
    return null
  }, [loadClassrooms])

  const joinClassroom = useCallback(async (inviteCode) => {
    try {
      const response = await fetch('http://localhost:5000/api/classrooms/join', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ invite_code: inviteCode })
      })

      if (response.ok) {
        await loadClassrooms()
        return true
      }
    } catch (error) {
      console.error('Erro ao entrar na turma:', error)
    }
    return false
  }, [loadClassrooms])

  const openClassroom = useCallback(async (classroomId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/classrooms/${classroomId}`, {
        headers: getHeaders()
      })

      if (!response.ok) {
        return null
      }

      const data = await response.json()
      setCurrentClassroom(data.classroom)
      return data.classroom
    } catch (error) {
      console.error('Erro ao abrir turma:', error)
      return null
    }
  }, [])

  const closeClassroom = useCallback(() => {
    setCurrentClassroom(null)
  }, [])

  // ========== OBJETOS ==========
  const addObject = useCallback((type, position = { x: 0, y: 0 }) => {
    const newObject = {
      id: uuidv4(),
      type,
      position,
      rotation: 0,
      scale: 1,
      properties: {}
    }

    setObjects(prev => [...prev, newObject])
    return newObject
  }, [])

  const updateObject = useCallback((objectId, updates) => {
    setObjects(prev =>
      prev.map(obj =>
        obj.id === objectId ? { ...obj, ...updates } : obj
      )
    )
  }, [])

  const deleteObject = useCallback((objectId) => {
    setObjects(prev => prev.filter(obj => obj.id !== objectId))
    // Remove conexões vinculadas a este objeto
    setConnections(prev =>
      prev.filter(conn =>
        !conn.from.includes(objectId) && !conn.to.includes(objectId)
      )
    )
    if (selectedObject?.id === objectId) {
      setSelectedObject(null)
    }
  }, [selectedObject])

  // ========== CONEXÕES ==========
  const addConnection = useCallback((fromId, toId) => {
    const parseObjectId = (pinId) => String(pinId).split('.')[0]
    const sourceId = parseObjectId(fromId)
    const targetId = parseObjectId(toId)

    if (sourceId === targetId) {
      console.warn('Não é possível conectar um objeto a ele mesmo')
      return false
    }

    const fromObj = objects.find(obj => obj.id === sourceId)
    const toObj = objects.find(obj => obj.id === targetId)

    if (!fromObj || !toObj) return false

    const alreadyExists = connections.some(conn =>
      parseObjectId(conn.from) === sourceId && parseObjectId(conn.to) === targetId
    )

    if (alreadyExists) {
      console.warn('Conexão já existe entre esses objetos')
      return false
    }

    const newConnection = {
      id: uuidv4(),
      from: sourceId,
      to: targetId
    }

    setConnections(prev => [...prev, newConnection])
    return true
  }, [objects, connections])

  const removeConnection = useCallback((connectionId) => {
    setConnections(prev => prev.filter(conn => conn.id !== connectionId))
  }, [])

  // ========== SIMULAÇÃO ==========
  const startSimulation = useCallback(() => {
    setIsSimulating(true)
  }, [])

  const stopSimulation = useCallback(() => {
    setIsSimulating(false)
  }, [])

  // Carregar dados na inicialização
  useEffect(() => {
    loadUserData()
  }, [loadUserData])

  // Auto-salvar projeto atual
  useEffect(() => {
    if (currentProject && (objects.length > 0 || connections.length > 0)) {
      const timeoutId = setTimeout(saveCurrentProject, 2000)
      return () => clearTimeout(timeoutId)
    }
  }, [objects, connections, saveCurrentProject])

  const value = {
    // Usuário
    currentUser,
    login,
    logout,

    // Projetos
    projects,
    currentProject,
    createProject,
    openProject,
    deleteProject,
    saveCurrentProject,

    // Turmas
    classrooms,
    currentClassroom,
    createClassroom,
    openClassroom,
    closeClassroom,
    joinClassroom,

    // Objetos
    objects,
    selectedObject,
    setSelectedObject,
    addObject,
    updateObject,
    deleteObject,

    // Conexões
    connections,
    addConnection,
    removeConnection,

    // Simulação
    isSimulating,
    startSimulation,
    stopSimulation
  }

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  )
}

export const useProject = () => {
  const context = React.useContext(ProjectContext)
  if (!context) {
    throw new Error('useProject deve ser usado dentro de ProjectProvider')
  }
  return context
}
