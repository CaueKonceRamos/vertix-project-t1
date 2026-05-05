import React, { useState, useEffect } from 'react';
import '../styles/ClassroomScreen.css';

const ClassroomScreen = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [classroom, setClassroom] = useState(null);
  const [projects, setProjects] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [isTeacher, setIsTeacher] = useState(false); // Mock - será do contexto
  const [inviteCode, setInviteCode] = useState('A7K9L2');

  // Dados serão carregados da API
  useEffect(() => {
    const loadClassroomData = async () => {
      try {
        // TODO: Implementar chamada para API de dados da turma
        // const response = await fetch('/api/classroom/current');
        // const data = await response.json();
        // setClassroom(data.classroom);
        // setProjects(data.projects);
        // setParticipants(data.participants);
        setClassroom(null); // Vazio por enquanto
        setProjects([]);
        setParticipants([]);
      } catch (error) {
        console.error('Erro ao carregar dados da turma:', error);
        setClassroom(null);
        setProjects([]);
        setParticipants([]);
      }
    };

    loadClassroomData();
  }, []);

  const handleShareCode = () => {
    navigator.clipboard.writeText(inviteCode);
    alert('Código copiado para a área de transferência!');
  };

  const handleGenerateNewCode = () => {
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    setInviteCode(newCode);
  };

  const handleLeaveClassroom = () => {
    if (window.confirm('Tem certeza que deseja sair da turma?')) {
      console.log('Sair da turma');
    }
  };

  const handleRemoveParticipant = (participantId) => {
    if (window.confirm('Tem certeza que deseja remover este participante?')) {
      setParticipants(participants.filter(p => p.id !== participantId));
    }
  };

  const handleViewProject = (projectId) => {
    console.log('Ver projeto:', projectId);
  };

  const handleLikeProject = (projectId) => {
    setProjects(projects.map(project =>
      project.id === projectId
        ? { ...project, likes: project.likes + 1 }
        : project
    ));
  };

  const handleCommentProject = (projectId) => {
    console.log('Comentar no projeto:', projectId);
  };

  if (!classroom) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="classroom-screen">
      {/* Header da turma */}
      <div className="classroom-header">
        <div className="classroom-info">
          <h1 className="classroom-name">{classroom.name}</h1>
          <p className="classroom-teacher">{classroom.teacher}</p>
          <div className="classroom-code">
            <span>Código: <strong>{inviteCode}</strong></span>
            <button className="code-btn" onClick={handleShareCode}>
              📋 Copiar
            </button>
          </div>
        </div>

        <div className="classroom-actions">
          <button className="action-btn primary" onClick={handleShareCode}>
            Compartilhar código
          </button>
          {!isTeacher && (
            <button className="action-btn danger" onClick={handleLeaveClassroom}>
              Sair da turma
            </button>
          )}
          {isTeacher && (
            <button className="action-btn secondary">
              Gerenciar turma
            </button>
          )}
        </div>
      </div>

      {/* Abas de navegação */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Inicio
        </button>
        <button
          className={`tab ${activeTab === 'gallery' ? 'active' : ''}`}
          onClick={() => setActiveTab('gallery')}
        >
          Galeria
        </button>
        <button
          className={`tab ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          Chat
        </button>
        <button
          className={`tab ${activeTab === 'participants' ? 'active' : ''}`}
          onClick={() => setActiveTab('participants')}
        >
          Participantes
        </button>
        <button
          className={`tab ${activeTab === 'code' ? 'active' : ''}`}
          onClick={() => setActiveTab('code')}
        >
          Codigo
        </button>
      </div>

      {/* Conteúdo das abas */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="overview-grid">
              <div className="overview-card">
                <h3>Resumo da Turma</h3>
                <p>{classroom.description}</p>
                <div className="stats">
                  <div className="stat">
                    <span className="stat-number">{classroom.participantsCount}</span>
                    <span className="stat-label">Participantes</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">{classroom.projectsCount}</span>
                    <span className="stat-label">Projetos</span>
                  </div>
                </div>
              </div>

              <div className="overview-card">
                <h3>Atividade Recente</h3>
                <div className="activity-list">
                  <div className="activity-item">
                    <span className="activity-icon">Usuario</span>
                    <span>Novo projeto: "Circuito Básico com LED"</span>
                  </div>
                  <div className="activity-item">
                    <span className="activity-icon">Usuario</span>
                    <span>Ana Clara entrou na turma</span>
                  </div>
                  <div className="activity-item">
                    <span className="activity-icon">Mensagem</span>
                    <span>5 novas mensagens no chat</span>
                  </div>
                </div>
              </div>

              <div className="overview-card">
                <h3>Avisos do Professor</h3>
                <div className="announcement">
                  <p>Aviso: Lembrem-se: prazo para entrega do projeto final e sexta-feira!</p>
                  <small>Postado ha 2 dias</small>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="gallery-tab">
            <div className="projects-grid">
              {projects.map(project => (
                <div key={project.id} className="project-card">
                  <div className="project-image">
                    <img src={project.image} alt={project.name} />
                    <div className="project-overlay">
                      <button
                        className="view-btn"
                        onClick={() => handleViewProject(project.id)}
                      >
                        Ver projeto
                      </button>
                    </div>
                  </div>

                  <div className="project-info">
                    <h4>{project.name}</h4>
                    <p>por {project.author}</p>
                    <div className="project-stats">
                      <span>❤️ {project.likes}</span>
                      <span>💬 {project.comments}</span>
                    </div>
                    <div className="project-actions">
                      <button onClick={() => handleLikeProject(project.id)}>Curtir</button>
                      <button onClick={() => handleCommentProject(project.id)}>Comentar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="chat-tab">
            <div className="chat-placeholder">
              <p>Chat da turma sera integrado aqui</p>
              <small>Funcionalidade completa na tela de Chat dedicada</small>
            </div>
          </div>
        )}

        {activeTab === 'participants' && (
          <div className="participants-tab">
            <div className="participants-list">
              {participants.map(participant => (
                <div key={participant.id} className="participant-item">
                  <div className="participant-avatar">
                    {participant.type === 'teacher' ? 'P' : 'A'}
                  </div>
                  <div className="participant-info">
                    <span className="participant-name">{participant.name}</span>
                    <span className="participant-type">
                      {participant.type === 'teacher' ? 'Professor' : 'Aluno'}
                    </span>
                  </div>
                  {isTeacher && participant.type === 'student' && (
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveParticipant(participant.id)}
                    >
                      Remover
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-tab">
            <div className="code-card">
              <h3>Código de Acesso da Turma</h3>
              <div className="code-display">
                <span className="code-text">{inviteCode}</span>
                <button className="copy-btn" onClick={handleShareCode}>
                  📋 Copiar
                </button>
              </div>
              <p>Compartilhe este código com alunos que desejam entrar na turma.</p>

              {isTeacher && (
                <div className="code-actions">
                  <button
                    className="generate-btn"
                    onClick={handleGenerateNewCode}
                  >
                    🔄 Gerar novo código
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassroomScreen;