import React, { useState, useEffect } from 'react'
import { useProject } from '../context/ProjectContext'
import ClassroomDetails from './ClassroomDetails'
import '../styles/DashboardScreen.css'

export default function DashboardScreen({ onNavigate }) {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showCreateClassroomModal, setShowCreateClassroomModal] = useState(false)
  const [newClassroomName, setNewClassroomName] = useState('')
  const [newClassroomDescription, setNewClassroomDescription] = useState('')
  const [newClassroomCategory, setNewClassroomCategory] = useState('Eletrônica')
  const [newClassroomPrivacy, setNewClassroomPrivacy] = useState('public')
  const [isCreatingClassroom, setIsCreatingClassroom] = useState(false)

  const {
    currentUser,
    projects,
    classrooms,
    currentClassroom,
    createProject,
    openProject,
    deleteProject,
    createClassroom,
    openClassroom,
    closeClassroom,
    joinClassroom,
    logout
  } = useProject()

  const curiosities = [
    {
      category: 'Você sabia?',
      quote: '“Bem-vindo ao VolTix! Sabia que bilhões de dispositivos IoT já estão conectados no mundo?”'
    },
    {
      category: 'Você sabia?',
      quote: '“Curiosidade: a primeira lâmpada inteligente surgiu antes mesmo dos smartphones modernos.”'
    },
    {
      category: 'Você sabia?',
      quote: '“Se tudo estiver conectado, até sua geladeira pode ‘pensar’ mais do que você imagina 😄”'
    },
    {
      category: 'Você sabia?',
      quote: '“Você sabia? O cérebro humano gera cerca de 20 watts de energia — o suficiente para acender uma lâmpada fraca.”'
    },
    {
      category: 'Você sabia?',
      quote: '“A água pode ferver e congelar ao mesmo tempo em condições específicas chamadas ponto triplo.”'
    },
    {
      category: 'Você sabia?',
      quote: '“O espaço não tem som… mas sensores IoT conseguem ‘ouvir’ o universo de outra forma.”'
    },
    {
      category: 'Você sabia?',
      quote: '“Um bug não é só erro de código — o termo veio de um inseto real encontrado em um computador em 1947.”'
    },
    {
      category: 'Você sabia?',
      quote: '“A primeira linguagem de programação foi criada antes mesmo dos PCs existirem.”'
    },
    {
      category: 'Você sabia?',
      quote: '“Tudo que você vê aqui começou com 0 e 1… literalmente.”'
    },
    {
      category: 'Olá!',
      quote: '“Dica: até no mundo real, você também precisa ‘craftar’ suas ideias.”'
    },
    {
      category: 'Olá!',
      quote: '“Carregando mundo… construindo possibilidades infinitas.”'
    },
    {
      category: 'Olá!',
      quote: '“Cuidado: projetos grandes começam com apenas um bloco (ou um input 😄).”'
    },
    {
      category: 'Olá!',
      quote: '“Você sabia? Em jogos sandbox, a criatividade do jogador é praticamente infinita — igual aqui.”'
    },
    {
      category: 'Olá! ',
      quote: '“Bem-vindo ao VolTix — onde ideias viram projetos de IoT.”'
    },
    {
      category: ' Olá!',
      quote: '“Transforme sensores em soluções e ideias em sistemas.”'
    },
    {
      category: 'Olá!',
      quote: '“Aqui, cada projeto começa com uma conexão.”'
    },
    {
      category: 'Olá!',
      quote: '“Criando o futuro… um dispositivo por vez.”'
    }
  ]

  const [curiosityIndex, setCuriosityIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCuriosityIndex((prev) => (prev + 1) % curiosities.length)
    }, 8000)
    return () => clearInterval(timer)
  }, [curiosities.length])

  const isTeacher = currentUser?.role === 'teacher'

  // Estatísticas baseadas em dados reais
  const dashboardStats = isTeacher ? {
    turmas: classrooms.length,
    alunos: classrooms.reduce((total, c) => total + (c.members?.length || 0), 0),
    projetos: projects.filter(p => p.classroom_id).length,
    mensagens: 0 // TODO: implementar contagem de mensagens
  } : {
    turmas: classrooms.length,
    projetos: projects.filter(p => p.user_id === currentUser?.id).length,
    mensagens: 0,
    favoritos: 0
  }

  // Atividades recentes (vazio por enquanto)
  const recentActivity = []

  // Projetos recentes do usuário
  const userProjects = projects.filter(p => p.user_id === currentUser?.id).slice(0, 3)

  // Função para criar turma
  const handleCreateClassroom = async (e) => {
    e.preventDefault()
    if (!newClassroomName.trim()) return

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
      }
    } catch (error) {
      console.error('Erro ao criar turma:', error)
    } finally {
      setIsCreatingClassroom(false)
    }
  }

  // Dados vazios por enquanto - serão carregados da API
  const recentProjects = []

  const renderDashboard = () => (
    <div className="dashboard-content">
      <div className="dashboard-hero">
        <div>
          <span className="hero-eyebrow">Painel VolTix</span>
          <h1>Olá, {isTeacher ? 'Prof. ' : ''}{currentUser?.name} 👋</h1>
          <p className="hero-copy">Bem-vindo de volta ao VolTix. Aqui você gerencia turmas, cria projetos e encontra inspiração para desenvolver suas ideias de IoT.</p>
        </div>

        <div className="hero-actions">
          <button className="primary-hero-btn" onClick={() => onNavigate('my-projects')}>+ Novo Projeto</button>
          <button className="secondary-hero-btn" onClick={() => onNavigate('classroom')}>Ver minhas turmas</button>
        </div>
      </div>

      <div className="curiosity-card">
        <div className="curiosity-meta">
          <span className="curiosity-category">{curiosities[curiosityIndex].category}</span>
          <button type="button" className="curiosity-next" onClick={() => setCuriosityIndex((prev) => (prev + 1) % curiosities.length)}>
            Próxima
          </button>
        </div>
        <p className="curiosity-text">{curiosities[curiosityIndex].quote}</p>
      </div>

      <div className="quick-create-section">
        <div className="quick-create-card wide-card">
          <div className="create-icon">🚀</div>
          <h3>Crie seu próximo projeto</h3>
          <p>Use o editor para montar seu protótipo IoT com sensores, componentes e lógica conectada.</p>
          <button className="create-btn-primary" onClick={() => onNavigate('my-projects')}>Começar projeto</button>
        </div>
        <div className="quick-create-card wide-card">
          <div className="create-icon">📚</div>
          <h3>Gerencie suas turmas</h3>
          <p>Abra o painel de turmas para ver quem está matriculado, copiar códigos e acompanhar atividades.</p>
          <button className="create-btn-secondary" onClick={() => onNavigate('classroom')}>Ver turmas</button>
        </div>
      </div>

      {/* Minhas Turmas */}
      <div className="section">
        <div className="section-header">
          <h2>Minhas Turmas</h2>
          <button className="view-all-btn">Ver todas</button>
        </div>
        <div className="turmas-grid">
          {classrooms.slice(0, 3).map(classroom => (
            <div key={classroom.id} className="turma-card" onClick={() => openClassroom(classroom.id)}>
              <div className="turma-header">
                <h3>{classroom.name}</h3>
                <span className="novidades">{isTeacher ? classroom.member_count : 3} {isTeacher ? 'alunos' : 'novas'}</span>
              </div>
              <div className="turma-info">
                {isTeacher ? (
                  <>
                    <p>{classroom.member_count} alunos matriculados</p>
                    <p>Atividade: 12 mensagens hoje</p>
                    <p className="codigo">Código: {classroom.invite_code}</p>
                  </>
                ) : (
                  <>
                    <p>Prof. Silva</p>
                    <p>{classroom.member_count} alunos</p>
                    <p className="codigo">Código: {classroom.invite_code}</p>
                  </>
                )}
              </div>
              {isTeacher && (
                <div className="turma-actions-admin">
                  <button className="action-btn" onClick={(e) => { e.stopPropagation(); }}> Participantes</button>
                  <button className="action-btn" onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(classroom.invite_code); }}>📋 Copiar Código</button>
                </div>
              )}
            </div>
          ))}
          {classrooms.length === 0 && (
            <div className="empty-state">
              <p>Nenhuma turma encontrada</p>
              <p className="hint">
                {isTeacher ? 'Crie sua primeira turma!' : 'Peça o código da turma ao professor'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Atividade Recente e Projetos Recentes */}
      <div className="activity-projects-grid">
        {/* Atividade Recente */}
        <div className="section">
          <div className="section-header">
            <h2>{isTeacher ? 'Atividade das Turmas' : 'Atividade Recente'}</h2>
          </div>
          <div className="activity-list">
            {recentActivity.map(activity => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">
                  {activity.type === 'student_join' && '👋'}
                  {activity.type === 'project_submit' && '📤'}
                  {activity.type === 'message' && '💬'}
                  {activity.type === 'like' && '❤️'}
                  {activity.type === 'project' && '📤'}
                </div>
                <div className="activity-content">
                  <p><strong>{activity.user}</strong> {activity.action} <strong>{activity.target}</strong></p>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projetos Recentes */}
        <div className="section">
          <div className="section-header">
            <h2>{isTeacher ? 'Projetos dos Alunos' : 'Projetos Recentes'}</h2>
          </div>
          <div className="projects-list">
            {recentProjects.map(project => (
              <div key={project.id} className="project-item">
                <div className="project-info">
                  <h4>{project.name}</h4>
                  {isTeacher ? (
                    <>
                      <p>Por: {project.studentName}</p>
                      <p>Turma: {project.classroomName}</p>
                    </>
                  ) : (
                    <p>Turma: {project.classroomName}</p>
                  )}
                  <span className="project-time">há 2 horas</span>
                </div>
                <button className="open-project-btn" onClick={() => openProject(project.id)}>
                  {isTeacher ? 'Avaliar' : 'Abrir'}
                </button>
              </div>
            ))}
            {recentProjects.length === 0 && (
              <div className="empty-state">
                <p>{isTeacher ? 'Nenhum projeto enviado ainda' : 'Nenhum projeto ainda'}</p>
                <p className="hint">{isTeacher ? 'Seus alunos ainda não enviaram projetos' : 'Crie seu primeiro projeto!'}</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  )

  const renderTurmas = () => (
    <div className="turmas-content">
      <div className="content-header">
        <h1>Minhas Turmas</h1>
        <div className="header-actions">
          {isTeacher ? (
            <button className="primary-hero-btn" onClick={() => setShowCreateClassroomModal(true)}>+ Criar Nova Turma</button>
          ) : (
            <form className="join-form">
              <input
                type="text"
                placeholder="Código da turma"
                className="join-input"
              />
              <button type="submit" className="secondary-hero-btn">Entrar</button>
            </form>
          )}
        </div>
      </div>

      {classrooms.length === 0 ? (
        <div className="empty-state">
          <p>Nenhuma turma encontrada</p>
          <p className="hint">
            {isTeacher ? 'Crie sua primeira turma!' : 'Peça o código da turma ao professor'}
          </p>
        </div>
      ) : (
        <div className="turmas-grid-full">
          {classrooms.map(classroom => (
            <div key={classroom.id} className="turma-card-full" onClick={() => openClassroom(classroom.id)}>
              <div className="turma-card-top">
                <div>
                  <h3>{classroom.name}</h3>
                  <p className="turma-subtitle">{classroom.description || 'Turma com projetos e atividades conectadas.'}</p>
                </div>
                <span className="turma-tag">{classroom.member_count || 0} alunos</span>
              </div>
              <div className="turma-info-row">
                <span>{isTeacher ? `Código: ${classroom.invite_code}` : `Professor: ${classroom.teacher || '---'}`}</span>
                <span>{classroom.privacy === 'private' ? 'Privada' : 'Pública'}</span>
              </div>
              <div className="turma-actions">
                <button className="view-turma-btn">Abrir turma</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderProjetos = () => (
    <div className="projetos-content">
      <div className="content-header">
        <h1>{isTeacher ? 'Projetos dos Alunos' : 'Meus Projetos'}</h1>
        <button className="create-project-btn">
          + {isTeacher ? 'Criar Projeto' : 'Novo Projeto'}
        </button>
      </div>

      <div className="projects-grid">
        {(isTeacher ? projects : userProjects).length === 0 ? (
          <div className="empty-state">
            <p>{isTeacher ? 'Nenhum projeto enviado ainda' : 'Nenhum projeto criado ainda'}</p>
            <p className="hint">
              {isTeacher ? 'Seus alunos ainda não enviaram projetos' : 'Crie um para começar!'}
            </p>
          </div>
        ) : (
          (isTeacher ? projects : userProjects).map(project => (
            <div key={project.id} className="project-card">
              <div className="project-info">
                <h3>{project.name}</h3>
                <p className="date">
                  {new Date(project.created_at).toLocaleDateString('pt-BR')}
                </p>
                {isTeacher && (
                  <div className="project-meta">
                    <span className="student-name">Por: João Silva</span>
                    <span className="classroom-badge">Turma: Robótica Básica</span>
                  </div>
                )}
                {project.classroom_id && !isTeacher && (
                  <span className="classroom-badge">Turma</span>
                )}
              </div>
              <div className="project-actions">
                <button className="open-btn" onClick={() => openProject(project.id)}>
                  {isTeacher ? 'Avaliar' : 'Abrir'}
                </button>
                {!isTeacher && (
                  <button className="delete-btn" onClick={() => {
                    if (window.confirm('Tem certeza que deseja deletar este projeto?')) {
                      deleteProject(project.id)
                    }
                  }}>
                    Deletar
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )

  const renderContent = () => {
    if (currentClassroom) {
      return <ClassroomDetails classroom={currentClassroom} onBack={closeClassroom} />
    }

    switch (activeSection) {
      case 'turmas':
        return renderTurmas()
      case 'projetos':
        return renderProjetos()
      case 'galeria':
        return <div className="placeholder-content"><h1>Galeria de Projetos</h1><p>Em breve...</p></div>
      default:
        return renderDashboard()
    }
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">⚡</span>
            <span className="logo-text">VolTix</span>
          </div>
        </div>

        <div className="header-center">
          {/* Barra de pesquisa removida conforme solicitado */}
        </div>

        <div className="header-right">
          <div className="user-profile" onClick={() => setShowProfileMenu(!showProfileMenu)}>
            <img src="/api/placeholder/32/32" alt="Avatar" className="user-avatar" />
            <div className="user-info">
              <span className="user-name">{isTeacher ? `Prof. ${currentUser?.name}` : currentUser?.name}</span>
              <span className="user-role">{isTeacher ? 'Professor' : 'Estudante'}</span>
            </div>
          </div>
          {showProfileMenu && (
            <div className="profile-dropdown">
              <button type="button" className="dropdown-item" onClick={() => alert('Editar perfil ainda não está implementado')}>
                Editar perfil
              </button>
              <button type="button" className="dropdown-item" onClick={logout}>
                Sair
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="dashboard-main">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <nav className="sidebar-nav">
            <div className="nav-section">
              <button
                className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveSection('dashboard')}
              >
                Inicio
              </button>
              <button
                className="nav-item"
                onClick={() => onNavigate('my-projects')}
              >
                Meus Projetos
              </button>
              <button
                className="nav-item"
                onClick={() => onNavigate('classroom')}
              >
                Turma
              </button>
            </div>

            <div className="nav-section quick-actions">
              <h3>Ações Rápidas</h3>
              {isTeacher ? (
                <>
                  <button className="quick-action-btn" onClick={() => onNavigate('my-projects')}>
                    Criar projeto
                  </button>
                  <button className="quick-action-btn" onClick={() => onNavigate('classroom')}>
                    Criar turma
                  </button>
                  <button className="quick-action-btn">
                    Gerenciar alunos
                  </button>
                </>
              ) : (
                <>
                  <button className="quick-action-btn" onClick={() => onNavigate('my-projects')}>
                    Criar projeto
                  </button>
                  <button className="quick-action-btn">
                    Entrar em turma
                  </button>
                </>
              )}
            </div>

            <div className="nav-section user-actions">
              <button className="logout-btn" onClick={logout}>
                🚪 Sair da Conta
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="dashboard-content-area">
          {renderContent()}
        </main>
      </div>

      {/* Footer */}
      <footer className="dashboard-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="logo-icon">⚡</span>
              <span className="logo-text">VolTix</span>
            </div>
            <p>Plataforma de simulação e prototipagem desenvolvida no contexto da disciplina de Internet das Coisas (IoT), ministrada pelo professor Heleno Cardoso. </p>
          </div>

          <div className="footer-links">
            <div className="footer-section">
              <h4>Navegação</h4>
              <ul>
                <li><a href="#">Início</a></li>
                <li><a href="#">Turmas</a></li>
                <li><a href="#">Projetos</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Recursos</h4>
              <ul>
                <li><a href="#">Tutoriais</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Ajuda</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Suporte</h4>
              <ul>
                <li><a href="#">Contato</a></li>
                <li><a href="#">Reportar bug</a></li>
                <li><a href="#">Sugestões</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-legal">
            <a href="#">Termos de uso</a>
            <a href="#">Política de privacidade</a>
          </div>
          <div className="footer-copyright">
            © 2026 VolTix, por: Beatriz de Abreu, Cauê Valverde e Gustavo de Jesus. Todos os direitos reservados.
          </div>
        </div>
      </footer>

      {/* Modal de criação de turma */}
      {showCreateClassroomModal && (
        <div className="modal-overlay" onClick={() => setShowCreateClassroomModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Criar Nova Turma</h3>
              <button className="modal-close" onClick={() => setShowCreateClassroomModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateClassroom}>
              <div className="form-group">
                <label>Nome da Turma *</label>
                <input
                  type="text"
                  value={newClassroomName}
                  onChange={(e) => setNewClassroomName(e.target.value)}
                  placeholder="Ex: Turma de Robótica 2025"
                  required
                />
              </div>
              <div className="form-group">
                <label>Descrição</label>
                <textarea
                  value={newClassroomDescription}
                  onChange={(e) => setNewClassroomDescription(e.target.value)}
                  placeholder="Descreva o objetivo da turma..."
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Categoria</label>
                <select
                  value={newClassroomCategory}
                  onChange={(e) => setNewClassroomCategory(e.target.value)}
                >
                  <option value="Eletrônica">Eletrônica</option>
                  <option value="Programação">Programação</option>
                  <option value="Robótica">Robótica</option>
                  <option value="IoT">IoT</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
              <div className="form-group">
                <label>Privacidade</label>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      value="public"
                      checked={newClassroomPrivacy === 'public'}
                      onChange={(e) => setNewClassroomPrivacy(e.target.value)}
                    />
                    Pública
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="private"
                      checked={newClassroomPrivacy === 'private'}
                      onChange={(e) => setNewClassroomPrivacy(e.target.value)}
                    />
                    Privada
                  </label>
                </div>
              </div>
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
    </div>
  )
}