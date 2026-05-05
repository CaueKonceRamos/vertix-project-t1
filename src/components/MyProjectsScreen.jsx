import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import '../styles/MyProjectsScreen.css';

const MyProjectsScreen = ({ onNavigate }) => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const { currentUser, createProject, openProject, deleteProject, projects: contextProjects } = useProject();

  // Carregar projetos do contexto
  useEffect(() => {
    const userProjects = contextProjects.filter(p => p.user_id === currentUser?.id);
    setProjects(userProjects);
    setFilteredProjects(userProjects);
  }, [contextProjects, currentUser]);

  // Filtragem e ordenação
  useEffect(() => {
    let filtered = projects.filter(project => {
      if (filter === 'my-projects') return project.classroom !== null;
      if (filter === 'independent') return project.classroom === null;
      return true; // 'all'
    });

    // Ordenação
    filtered.sort((a, b) => {
      if (sortBy === 'recent') return new Date(b.updatedAt) - new Date(a.updatedAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      return 0;
    });

    setFilteredProjects(filtered);
  }, [projects, filter, sortBy]);

  const handleOpen = (projectId) => {
    openProject(projectId);
  };

  const handleDelete = async (projectId) => {
    if (window.confirm('Tem certeza que deseja excluir este projeto?')) {
      await deleteProject(projectId);
    }
  };

  const handleNewProject = () => {
    setShowCreateModal(true);
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;

    setIsCreating(true);
    try {
      const project = await createProject(newProjectName.trim());
      if (project) {
        setNewProjectName('');
        setShowCreateModal(false);
        // O projeto será automaticamente adicionado ao contexto
      }
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusLabel = (status) => {
    return status === 'published' ? 'Publicado' : 'Rascunho';
  };

  const getStatusColor = (status) => {
    return status === 'published' ? '#10b981' : '#f59e0b';
  };

  return (
    <div className="my-projects-screen">
      {/* Header */}
      <div className="projects-header">
        <h1 className="projects-title">Meus Projetos</h1>
        <button className="new-project-btn" onClick={handleNewProject}>
          + Novo projeto
        </button>
      </div>

      {/* Filtros e ordenação */}
      <div className="projects-controls">
        <div className="filter-group">
          <label>Filtro:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="control-select"
          >
            <option value="all">Todos os projetos</option>
            <option value="my-projects">Projetos de turma</option>
            <option value="independent">Projetos independentes</option>
          </select>
        </div>

        <div className="sort-group">
          <label>Ordenar por:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="control-select"
          >
            <option value="recent">Mais recentes</option>
            <option value="oldest">Mais antigos</option>
          </select>
        </div>
      </div>

      {/* Lista de projetos */}
      <div className="projects-list">
        {filteredProjects.map(project => (
          <div key={project.id} className="project-item">
            <div className="project-preview">
              <img src={project.image} alt={project.name} />
            </div>

            <div className="project-details">
              <h3 className="project-name">{project.name}</h3>

              <div className="project-meta">
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(project.status) }}
                >
                  {getStatusLabel(project.status)}
                </span>
                <span className="classroom-info">
                  {project.classroom ? `Turma: ${project.classroom}` : 'Projeto independente'}
                </span>
              </div>

              <div className="project-dates">
                <span>Criado: {new Date(project.createdAt).toLocaleDateString('pt-BR')}</span>
                <span>Atualizado: {new Date(project.updatedAt).toLocaleDateString('pt-BR')}</span>
              </div>

              {project.status === 'published' && (
                <div className="project-stats">
                  <span>{project.likes} curtidas</span>
                  <span>{project.comments} comentarios</span>
                </div>
              )}
            </div>

            <div className="project-actions">
              <button
                className="action-btn primary"
                onClick={() => handleOpen(project.id)}
              >
                Abrir
              </button>
              <button
                className="action-btn secondary"
                onClick={() => handleEdit(project.id)}
              >
                Editar
              </button>
              <button
                className="action-btn secondary"
                onClick={() => handleTogglePublish(project.id)}
              >
                {project.status === 'published' ? 'Remover da galeria' : 'Publicar'}
              </button>
              <button
                className="action-btn danger"
                onClick={() => handleDelete(project.id)}
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="empty-state">
          <p>Nenhum projeto encontrado</p>
          <p className="hint">Crie seu primeiro projeto para começar!</p>
          <button className="new-project-btn" onClick={handleNewProject}>
            + Criar primeiro projeto
          </button>
        </div>
      )}

      {/* Modal de criação de projeto */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Criar Novo Projeto</h2>
            <div className="modal-body">
              <label htmlFor="project-name">Nome do Projeto:</label>
              <input
                id="project-name"
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Digite o nome do projeto"
                disabled={isCreating}
              />
            </div>
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowCreateModal(false)}
                disabled={isCreating}
              >
                Cancelar
              </button>
              <button
                className="create-btn"
                onClick={handleCreateProject}
                disabled={!newProjectName.trim() || isCreating}
              >
                {isCreating ? 'Criando...' : 'Criar Projeto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProjectsScreen;