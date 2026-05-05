import React, { useState, useEffect } from 'react';
import '../styles/GalleryScreen.css';

const GalleryScreen = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  // Dados serão carregados da API
  useEffect(() => {
    const loadProjects = async () => {
      try {
        // TODO: Implementar chamada para API de projetos públicos
        // const response = await fetch('/api/projects/public');
        // const data = await response.json();
        // setProjects(data);
        setProjects([]); // Vazio por enquanto
        setFilteredProjects([]);
      } catch (error) {
        console.error('Erro ao carregar projetos:', error);
        setProjects([]);
        setFilteredProjects([]);
      }
    };

    loadProjects();
  }, []);

  // Filtragem e busca
  useEffect(() => {
    let filtered = projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesClassroom = selectedClassroom === 'all' || project.classroom === selectedClassroom;
      const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory;

      return matchesSearch && matchesClassroom && matchesCategory;
    });

    // Ordenação
    filtered.sort((a, b) => {
      if (sortBy === 'likes') return b.likes - a.likes;
      if (sortBy === 'recent') return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });

    setFilteredProjects(filtered);
  }, [projects, searchTerm, selectedClassroom, selectedCategory, sortBy]);

  const handleLike = (projectId) => {
    setProjects(projects.map(project =>
      project.id === projectId
        ? { ...project, likes: project.likes + 1 }
        : project
    ));
  };

  const handleComment = (projectId) => {
    // Implementar modal de comentários
    console.log('Abrir comentários para projeto:', projectId);
  };

  const handleFavorite = (projectId) => {
    // Implementar sistema de favoritos
    console.log('Favoritar projeto:', projectId);
  };

  return (
    <div className="gallery-screen">
      {/* Header */}
      <div className="gallery-header">
        <h1 className="gallery-title">Galeria de Projetos</h1>

        {/* Barra de busca */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar projetos, autores ou tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        <button className="search-btn">Buscar</button>
        </div>

        {/* Filtros */}
        <div className="filters">
          <select
            value={selectedClassroom}
            onChange={(e) => setSelectedClassroom(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todas as turmas</option>
            <option value="Eletrônica Básica">Eletrônica Básica</option>
            <option value="Robótica">Robótica</option>
            <option value="IoT Avançado">IoT Avançado</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todas as categorias</option>
            <option value="Arduino">Arduino</option>
            <option value="IoT">IoT</option>
            <option value="Robótica">Robótica</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="recent">Mais recentes</option>
            <option value="likes">Mais curtidos</option>
          </select>
        </div>
      </div>

      {/* Grid de projetos */}
      <div className="projects-grid">
        {filteredProjects.map(project => (
          <div key={project.id} className="project-card">
            <div className="project-image">
              <img src={project.image} alt={project.name} />
              <div className="project-overlay">
                <button className="view-project-btn">Ver projeto</button>
              </div>
            </div>

            <div className="project-info">
              <h3 className="project-name">{project.name}</h3>
              <p className="project-author">por {project.author}</p>
              <p className="project-classroom">{project.classroom}</p>

              <div className="project-tags">
                {project.tags.map(tag => (
                  <span key={tag} className="tag">#{tag}</span>
                ))}
              </div>

              <div className="project-stats">
                <span className="stat">
                  <span className="stat-icon">Curtidas</span>
                  {project.likes}
                </span>
                <span className="stat">
                  <span className="stat-icon">Comentarios</span>
                  {project.comments}
                </span>
              </div>

              <div className="project-actions">
                <button
                  className="action-btn like-btn"
                  onClick={() => handleLike(project.id)}
                >
                  Curtir
                </button>
                <button
                  className="action-btn comment-btn"
                  onClick={() => handleComment(project.id)}
                >
                  Comentar
                </button>
                <button
                  className="action-btn favorite-btn"
                  onClick={() => handleFavorite(project.id)}
                >
                  Favoritar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="empty-state">
          <p>Nenhum projeto encontrado</p>
          <p className="hint">Tente ajustar os filtros ou criar um novo projeto!</p>
        </div>
      )}
    </div>
  );
};

export default GalleryScreen;