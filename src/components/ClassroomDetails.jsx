import React, { useEffect, useMemo, useState } from 'react'
import { useProject } from '../context/ProjectContext'
import '../styles/DashboardScreen.css'

function getHeaders() {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  }
}

export default function ClassroomDetails({ classroom, onBack }) {
  const { currentUser, openProject, createProject } = useProject()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [members, setMembers] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newProjectName, setNewProjectName] = useState('')
  const [creatingProject, setCreatingProject] = useState(false)

  const classroomHeader = useMemo(() => {
    return classroom?.name || 'Turma'
  }, [classroom])

  useEffect(() => {
    async function loadData() {
      if (!classroom?.id) return
      setLoading(true)
      setError('')

      try {
        const [membersResponse, projectsResponse] = await Promise.all([
          fetch(`http://localhost:5000/api/classrooms/${classroom.id}/members`, { headers: getHeaders() }),
          fetch(`http://localhost:5000/api/classrooms/${classroom.id}/projects`, { headers: getHeaders() })
        ])

        if (!membersResponse.ok || !projectsResponse.ok) {
          throw new Error('Erro ao carregar dados da turma')
        }

        const membersData = await membersResponse.json()
        const projectsData = await projectsResponse.json()

        setMembers(membersData.members || [])
        setProjects(projectsData.projects || [])
      } catch (err) {
        console.error(err)
        setError('Não foi possível carregar os dados da turma. Tente novamente.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [classroom])

  const handleCreateClassroomProject = async (e) => {
    e.preventDefault()
    if (!newProjectName.trim()) return

    setCreatingProject(true)
    try {
      const project = await createProject(newProjectName.trim(), classroom.id)
      if (project) {
        setNewProjectName('')
        openProject(project.id)
      }
    } catch (err) {
      console.error('Erro ao criar projeto na turma:', err)
    } finally {
      setCreatingProject(false)
    }
  }

  const summaryStats = [
    {
      label: 'Projetos ativos',
      value: projects.length,
      description: 'Trabalhos compartilhados na turma'
    },
    {
      label: 'Participantes',
      value: members.length,
      description: 'Alunos e professor conectados'
    }
  ]

  return (
    <div className="classroom-details-card">
      <div className="classroom-details-header">
        <button className="secondary-btn" type="button" onClick={onBack}>
          ← Voltar
        </button>
        <div>
          <h3>{classroomHeader}</h3>
          <p className="success-text">Painel da turma com dashboard e galeria.</p>
        </div>
      </div>

      <div className="classroom-tabs">
        {['dashboard', 'gallery'].map(tab => (
          <button
            key={tab}
            type="button"
            className={`classroom-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'dashboard' ? 'Dashboard' : 'Galeria'}
          </button>
        ))}
      </div>

      <div className="classroom-summary">
        <div>
          <strong>Categoria</strong>
          <p>{classroom.category || 'Não informada'}</p>
        </div>
        <div>
          <strong>Privacidade</strong>
          <p>{classroom.privacy === 'private' ? 'Privada' : 'Pública'}</p>
        </div>
        <div>
          <strong>Código de acesso</strong>
          <p>{classroom.invite_code}</p>
        </div>
      </div>

      <div className="classroom-details-meta">
        <div>
          <strong>Descrição</strong>
          <p>{classroom.description || 'Sem descrição.'}</p>
        </div>
        <div>
          <strong>Professor</strong>
          <p>{currentUser?.role === 'teacher' ? 'Você' : 'Professor da turma'}</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="classroom-loading">Carregando informações...</div>
      ) : (
        <div className="classroom-tab-panel">
          {activeTab === 'dashboard' && (
            <>
              <div className="dashboard-grid">
                {summaryStats.map(stat => (
                  <div key={stat.label} className="dashboard-card">
                    <span>{stat.label}</span>
                    <strong>{stat.value}</strong>
                    <p>{stat.description}</p>
                  </div>
                ))}
              </div>

              <div className="classroom-quick-actions">
                <div className="quick-card">
                  <h4>Criar projeto da turma</h4>
                  <form className="chat-form" onSubmit={handleCreateClassroomProject}>
                    <input
                      type="text"
                      placeholder="Nome do projeto..."
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                    />
                    <button type="submit" disabled={creatingProject}>
                      {creatingProject ? 'Criando...' : 'Criar projeto'}
                    </button>
                  </form>
                </div>

                <div className="quick-card">
                  <h4>Ações rápidas</h4>
                  <div className="quick-actions-list">
                    <button type="button" onClick={() => setActiveTab('gallery')}>
                      Ver galeria
                    </button>
                  </div>
                </div>
              </div>

              <div className="recent-blocks">
                <div className="recent-block">
                  <h4>Projetos recentes</h4>
                  {projects.length === 0 ? (
                    <p>Nenhum projeto criado nesta turma ainda.</p>
                  ) : (
                    <div className="recent-projects-list">
                      {projects.slice(0, 4).map(project => (
                        <div key={project.id} className="project-card-small">
                          <div>
                            <h5>{project.name}</h5>
                            <p>{project.description || 'Sem descrição'}</p>
                          </div>
                          <button type="button" onClick={() => openProject(project.id)}>
                            Abrir
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'gallery' && (
            <div className="gallery-panel">
              <div className="panel-header">
                <h4>Projetos da turma</h4>
                <span>{projects.length} projetos</span>
              </div>

              {projects.length === 0 ? (
                <p className="empty-state">Nenhum projeto disponível. Crie o primeiro!</p>
              ) : (
                <div className="project-gallery-grid">
                  {projects.map(project => (
                    <div key={project.id} className="project-card-small">
                      <div>
                        <h5>{project.name}</h5>
                        <p>{project.description || 'Sem descrição'}</p>
                        <small>por {project.user_name}</small>
                      </div>
                      <button type="button" onClick={() => openProject(project.id)}>
                        Abrir
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  )
}
