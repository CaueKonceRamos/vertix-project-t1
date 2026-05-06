import React from 'react'
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
    closeClassroom
  } = useProject()

  const classList = classrooms.length > 0 ? classrooms : [exampleClassroom]

  const handleOpenClassroom = async (classroom) => {
    if (classroom.id === exampleClassroom.id) {
      alert('Esta é uma turma de exemplo. Quando você entrar em uma turma real, ela aparecerá aqui.')
      return
    }

    await openClassroom(classroom.id)
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
            <button className="new-project-btn" onClick={() => onNavigate('my-projects')}>
              + Novo projeto
            </button>
          </div>

          <div className="classroom-cards">
            {classList.map((classroom) => {
              const teacherName = classroom.teacher_name || (currentUser?.role === 'teacher'
                ? currentUser?.name
                : 'Professor responsável')

              return (
                <div key={classroom.id} className="classroom-card">
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
                    <button className="view-classroom-btn" onClick={() => handleOpenClassroom(classroom)}>
                      Ver projetos
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default ClassroomScreen
