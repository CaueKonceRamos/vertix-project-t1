import React, { useState } from 'react'
import { useProject } from '../context/ProjectContext'
import DashboardLayout from './DashboardLayout'
import ClassroomDetails from './ClassroomDetails'
import '../styles/ClassroomScreen.css'

const exampleClassroom = {
  id: 'example-classroom',
  name: 'Turma Exemplo de IoT',
  teacher_name: 'Prof. Helena Souza',
  member_count: 24,
  invite_code: 'VOLTIX',
  description: 'Uma turma de demonstração com exemplos de projetos de Internet das Coisas.',
  teacher: 'Prof. Helena Souza'
}

const ClassroomScreen = ({ onNavigate }) => {
  const {
    currentUser,
    classrooms,
    currentClassroom,
    openClassroom,
    closeClassroom,
    createClassroom,
    joinClassroom
  } = useProject()

  const [showCreateClassroomModal, setShowCreateClassroomModal] = useState(false)
  const [newClassroomName, setNewClassroomName] = useState('')
  const [newClassroomDescription, setNewClassroomDescription] = useState('')
  const [newClassroomCategory, setNewClassroomCategory] = useState('Eletrônica')
  const [newClassroomPrivacy, setNewClassroomPrivacy] = useState('public')
  const [isCreatingClassroom, setIsCreatingClassroom] = useState(false)
  const [createClassroomError, setCreateClassroomError] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [joinError, setJoinError] = useState('')
  const [isJoining, setIsJoining] = useState(false)

  const isTeacher = currentUser?.role === 'teacher'
  const classList = classrooms.length > 0 ? classrooms : [exampleClassroom]

  const handleOpenClassroom = async (classroom) => {
    if (classroom.id === exampleClassroom.id) {
      alert('Esta é uma turma de exemplo. Quando você entrar em uma turma real, ela aparecerá aqui.')
      return
    }

    await openClassroom(classroom.id)
  }

  const handleCreateClassroomSubmit = async (e) => {
    e.preventDefault()
    setCreateClassroomError('')

    if (!newClassroomName.trim()) {
      setCreateClassroomError('Informe o nome da turma.')
      return
    }

    setIsCreatingClassroom(true)
    try {
      const classroom = await createClassroom(
        newClassroomName.trim(),
        newClassroomDescription.trim(),
        newClassroomCategory,
        newClassroomPrivacy
      )

      if (classroom) {
        setShowCreateClassroomModal(false)
        setNewClassroomName('')
        setNewClassroomDescription('')
        setNewClassroomCategory('Eletrônica')
        setNewClassroomPrivacy('public')
      } else {
        setCreateClassroomError('Não foi possível criar a turma. Tente novamente.')
      }
    } catch (error) {
      setCreateClassroomError('Não foi possível criar a turma. Verifique os dados e tente novamente.')
    } finally {
      setIsCreatingClassroom(false)
    }
  }

  const handleJoinClassroomSubmit = async (e) => {
    e.preventDefault()

    if (!inviteCode.trim()) {
      setJoinError('Informe o código da turma.')
      return
    }

    setIsJoining(true)
    setJoinError('')
    try {
      const success = await joinClassroom(inviteCode.trim())
      if (success) {
        setInviteCode('')
      } else {
        setJoinError('Não foi possível entrar na turma. Verifique o código.')
      }
    } catch (error) {
      setJoinError('Não foi possível entrar na turma. Verifique o código.')
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <DashboardLayout onNavigate={onNavigate} activeItem="classroom">
      {currentClassroom ? (
        <ClassroomDetails classroom={currentClassroom} onBack={closeClassroom} />
      ) : (
        <div className="classroom-list-screen">
          <div className="classroom-hero">
            <div>
              <span className="page-label">Turmas • VolTix</span>
              <h1>Minhas Turmas</h1>
              <p>Veja as turmas em que você está matriculado e acesse rapidamente os projetos vinculados.</p>
            </div>
            <div className="hero-actions">
              {isTeacher ? (
                <button className="primary-hero-btn" onClick={() => setShowCreateClassroomModal(true)}>
                  + Criar turma
                </button>
              ) : (
                <form className="join-form" onSubmit={handleJoinClassroomSubmit}>
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="Código da turma"
                    className="join-input"
                  />
                  <button type="submit" className="secondary-hero-btn" disabled={isJoining}>
                    {isJoining ? 'Entrando...' : 'Entrar'}
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="classroom-cards">
            {classList.map((classroom) => {
              const teacherName = classroom.teacher_name || (isTeacher ? currentUser?.name : 'Professor responsável')

              return (
                <div key={classroom.id} className="classroom-card" onClick={() => handleOpenClassroom(classroom)}>
                  <div className="card-header">
                    <h2>{classroom.name}</h2>
                    <span className="card-tag">{classroom.member_count || 0} alunos</span>
                  </div>
                  <p className="card-description">{classroom.description || 'Turma com atividades e projetos de IoT.'}</p>
                  <div className="card-meta">
                    <span>Professor: {teacherName}</span>
                    <span>Código: {classroom.invite_code || 'N/A'}</span>
                  </div>
                  <div className="card-actions">
                    <button
                      className="view-classroom-btn"
                      onClick={(e) => { e.stopPropagation(); handleOpenClassroom(classroom) }}
                    >
                      Ver projetos
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {!isTeacher && joinError && <div className="form-error">{joinError}</div>}
        </div>
      )}

      {showCreateClassroomModal && (
        <div className="modal-overlay" onClick={() => setShowCreateClassroomModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Criar Nova Turma</h3>
              <button className="modal-close" type="button" onClick={() => setShowCreateClassroomModal(false)}>×</button>
            </div>

            <form className="classroom-form" onSubmit={handleCreateClassroomSubmit}>
              <label>
                Nome da Turma *
                <input
                  type="text"
                  value={newClassroomName}
                  onChange={(e) => setNewClassroomName(e.target.value)}
                  placeholder="Ex: Turma de Robótica 2025"
                  required
                />
              </label>

              <label>
                Descrição
                <textarea
                  value={newClassroomDescription}
                  onChange={(e) => setNewClassroomDescription(e.target.value)}
                  placeholder="Descreva o objetivo da turma..."
                  rows={4}
                />
              </label>

              <div className="form-row">
                <label>
                  Categoria
                  <select value={newClassroomCategory} onChange={(e) => setNewClassroomCategory(e.target.value)}>
                    <option value="Eletrônica">Eletrônica</option>
                    <option value="Programação">Programação</option>
                    <option value="Robótica">Robótica</option>
                    <option value="IoT">IoT</option>
                    <option value="Outros">Outros</option>
                  </select>
                </label>

                <label>
                  Privacidade
                  <select value={newClassroomPrivacy} onChange={(e) => setNewClassroomPrivacy(e.target.value)}>
                    <option value="public">Pública</option>
                    <option value="private">Privada</option>
                  </select>
                </label>
              </div>

              {createClassroomError && <div className="form-error">{createClassroomError}</div>}

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateClassroomModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={isCreatingClassroom}>
                  {isCreatingClassroom ? 'Criando...' : 'Criar Turma'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default ClassroomScreen
