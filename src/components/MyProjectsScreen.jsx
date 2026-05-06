import React, { useState, useEffect } from 'react'
import { useProject } from '../context/ProjectContext'
import DashboardLayout from './DashboardLayout'
import '../styles/MyProjectsScreen.css'

const emptyForm = {
  name: '',
  description: '',
  classroom_id: '',
  imageFile: null,
  imagePreview: '',
  attachments: [],
  attachmentNames: []
}

const MyProjectsScreen = ({ onNavigate }) => {
  const [filteredProjects, setFilteredProjects] = useState([])
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [projectForm, setProjectForm] = useState(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const {
    currentUser,
    projects,
    createProject,
    updateProject,
    openProject,
    deleteProject,
    classrooms
  } = useProject()

  useEffect(() => {
    let filtered = [...projects]

    filtered = filtered.filter((project) => {
      if (filter === 'my-projects') return project.classroom_id !== null
      if (filter === 'independent') return project.classroom_id === null
      return true
    })

    filtered.sort((a, b) => {
      if (sortBy === 'recent') return new Date(b.updated_at || b.updatedAt) - new Date(a.updated_at || a.updatedAt)
      if (sortBy === 'oldest') return new Date(a.created_at || a.createdAt) - new Date(b.created_at || b.createdAt)
      return 0
    })

    setFilteredProjects(filtered)
  }, [projects, filter, sortBy])

  const resetForm = () => {
    setProjectForm(emptyForm)
    setFormError('')
  }

  const handleOpen = (projectId) => {
    openProject(projectId)
  }

  const handleDelete = async (projectId) => {
    if (window.confirm('Tem certeza que deseja excluir este projeto?')) {
      await deleteProject(projectId)
    }
  }

  const handleStartCreate = () => {
    setEditingProject(null)
    resetForm()
    setShowForm(true)
  }

  const handleEdit = (project) => {
    setEditingProject(project)
    setShowForm(true)
    setProjectForm({
      name: project.name || '',
      description: project.description || '',
      classroom_id: project.classroom_id || '',
      imageFile: null,
      imagePreview: '',
      attachments: [],
      attachmentNames: []
    })
    setFormError('')
  }

  const handleFieldChange = (field, value) => {
    setProjectForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setProjectForm((prev) => ({
        ...prev,
        imageFile: file,
        imagePreview: reader.result
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleAttachmentsChange = (event) => {
    const files = Array.from(event.target.files || [])
    setProjectForm((prev) => ({
      ...prev,
      attachments: files,
      attachmentNames: files.map((file) => file.name)
    }))
  }

  const handleSubmitCreate = async () => {
    if (!projectForm.name.trim() || !projectForm.description.trim()) {
      setFormError('Nome e descrição são obrigatórios.')
      return
    }

    setIsSaving(true)
    setFormError('')

    const media = {}
    if (projectForm.imagePreview) {
      media.image = projectForm.imagePreview
    }
    if (projectForm.attachmentNames.length) {
      media.attachments = projectForm.attachmentNames
    }

    try {
      await createProject({
        name: projectForm.name.trim(),
        description: projectForm.description.trim(),
        classroom_id: projectForm.classroom_id || null,
        data: { media }
      })
      resetForm()
      setShowForm(false)
    } catch (error) {
      console.error('Erro ao criar projeto:', error)
      setFormError('Não foi possível criar o projeto. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSubmitEdit = async () => {
    if (!projectForm.name.trim() || !projectForm.description.trim()) {
      setFormError('Nome e descrição são obrigatórios.')
      return
    }

    setIsSaving(true)
    setFormError('')

    try {
      await updateProject(editingProject.id, {
        name: projectForm.name.trim(),
        description: projectForm.description.trim()
      })
      setEditingProject(null)
      setShowForm(false)
      resetForm()
    } catch (error) {
      console.error('Erro ao editar projeto:', error)
      setFormError('Não foi possível salvar as alterações.')
    } finally {
      setIsSaving(false)
    }
  }

  const creatorLabel = currentUser?.name || 'Usuário'

  return (
    <DashboardLayout onNavigate={onNavigate} activeItem="my-projects">
      <div className="my-projects-screen">
        <div className="projects-hero">
          <div className="hero-details">
            <button className="back-btn" onClick={() => onNavigate('dashboard')}>
              ← Voltar
            </button>
            <span className="hero-label">Dashboard • Meus Projetos</span>
            <h1>Meus Projetos</h1>
            <p>Organize seus projetos, gerencie turmas e crie conteúdos de IoT de forma rápida.</p>
          </div>

          <button className="new-project-btn hero-button" onClick={handleStartCreate}>
            + Novo projeto
          </button>
        </div>

        {showForm && (
          <section className="project-form-section">
            <div className="form-header">
              <div>
                <h2>{editingProject ? 'Editar Projeto' : 'Novo Projeto'}</h2>
                <p>{editingProject ? 'Você pode atualizar título e descrição do projeto.' : 'Preencha os dados principais para criar um novo projeto.'}</p>
              </div>
            </div>

            <div className="project-form">
              <div className="form-column">
                <label>
                  Nome do projeto <span className="required">*</span>
                  <input
                    type="text"
                    value={projectForm.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    placeholder="Digite o nome do projeto"
                  />
                </label>

                <label>
                  Descrição <span className="required">*</span>
                  <textarea
                    value={projectForm.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    placeholder="Descreva o objetivo do projeto"
                    rows={5}
                  />
                </label>

                <label>
                  Criador
                  <input type="text" value={creatorLabel} disabled />
                </label>

                <label>
                  Turma
                  <select
                    value={projectForm.classroom_id}
                    onChange={(e) => handleFieldChange('classroom_id', e.target.value)}
                    disabled={Boolean(editingProject)}
                  >
                    <option value="">Nenhuma turma (independente)</option>
                    {classrooms.map((classroom) => (
                      <option key={classroom.id} value={classroom.id}>
                        {classroom.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="form-column">
                <label>
                  Imagem do projeto
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={Boolean(editingProject)}
                  />
                </label>
                {projectForm.imagePreview && (
                  <div className="image-preview">
                    <img src={projectForm.imagePreview} alt="Preview" />
                  </div>
                )}

                <label>
                  Anexos / documentos
                  <input
                    type="file"
                    multiple
                    onChange={handleAttachmentsChange}
                    disabled={Boolean(editingProject)}
                  />
                </label>
                {projectForm.attachmentNames.length > 0 && (
                  <div className="attachment-list">
                    {projectForm.attachmentNames.map((name) => (
                      <span key={name} className="attachment-name">{name}</span>
                    ))}
                  </div>
                )}

                {editingProject && (
                  <p className="edit-note">Imagem e anexos não podem ser alterados nesta tela.</p>
                )}
              </div>
            </div>

            {formError && <div className="form-error">{formError}</div>}

            <div className="form-actions">
              <button className="cancel-btn" type="button" onClick={() => { setShowForm(false); setEditingProject(null); resetForm() }}>
                Cancelar
              </button>
              <button
                className="create-btn"
                type="button"
                onClick={editingProject ? handleSubmitEdit : handleSubmitCreate}
                disabled={isSaving}
              >
                {isSaving ? 'Salvando...' : editingProject ? 'Salvar alterações' : 'Criar projeto'}
              </button>
            </div>
          </section>
        )}

        <div className="projects-summary-cards">
          <div className="summary-card">
            <span>Total de projetos</span>
            <strong>{filteredProjects.length}</strong>
          </div>
          <div className="summary-card">
            <span>Projetos de turma</span>
            <strong>{filteredProjects.filter((project) => project.classroom_id !== null).length}</strong>
          </div>
          <div className="summary-card">
            <span>Projetos independentes</span>
            <strong>{filteredProjects.filter((project) => project.classroom_id === null).length}</strong>
          </div>
        </div>

        <div className="projects-actions-bar">
          <div className="filter-group">
            <label>Filtro</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="control-select">
              <option value="all">Todos os projetos</option>
              <option value="my-projects">Projetos de turma</option>
              <option value="independent">Projetos independentes</option>
            </select>
          </div>

          <div className="sort-group">
            <label>Ordenar por</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="control-select">
              <option value="recent">Mais recentes</option>
              <option value="oldest">Mais antigos</option>
            </select>
          </div>
        </div>

        <div className="projects-grid">
          {filteredProjects.map((project) => (
            <div key={project.id} className="project-card">
              <div className="project-card-top">
                <div className="project-preview">
                  <div className="project-placeholder">{project.name?.slice(0, 2).toUpperCase()}</div>
                </div>
                <div className="project-tag">{project.classroom_id ? 'Turma' : 'Independente'}</div>
              </div>

              <div className="project-card-body">
                <h3>{project.name}</h3>
                <p>{project.description || 'Sem descrição disponível.'}</p>
                <div className="project-info-row">
                  <span>{project.classroom_id ? 'Vinculado a turma' : 'Projeto independente'}</span>
                  <span>{new Date(project.created_at || project.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>

              <div className="project-card-footer">
                <button className="action-btn primary" onClick={() => handleOpen(project.id)}>
                  Abrir
                </button>
                <button className="action-btn secondary" onClick={() => handleEdit(project)}>
                  Editar
                </button>
                <button className="action-btn danger" onClick={() => handleDelete(project.id)}>
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="empty-state">
            <h2>Sem projetos encontrados</h2>
            <p>Crie um projeto para começar a construir e visualizar suas ideias de IoT.</p>
            <button className="new-project-btn" onClick={handleStartCreate}>
              + Criar projeto
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default MyProjectsScreen
