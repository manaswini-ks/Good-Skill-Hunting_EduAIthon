import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  PlusCircle, Pencil, Trash2, Github, Globe, Code, FileText, Eye, ListFilter, Briefcase, Layout, ArrowLeft, ArrowRight
} from 'lucide-react';

export default function ProjectShowcase() {
  const student_id = localStorage.getItem('student_id');
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(initialFormState());
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 6;
  
  // Categories derived from project tech stacks
  const [categories, setCategories] = useState([]);

  function initialFormState() {
    return { 
      title: '', 
      description: '', 
      github_url: '', 
      live_url: '', 
      tech_stack: '',
      project_image: '',
      documentation_url: '',
      category: 'web' // Default category
    };
  }

  useEffect(() => {
    if (!student_id) {
      setError('No student ID found. Please log in.');
      return;
    }

    axios.get(`http://localhost:5000/student/projects/${student_id}`)
      .then(res => {
        setProjects(res.data);
        
        // Extract unique categories from tech stacks
        const allTechStacks = res.data.flatMap(p => p.tech_stack || []);
        const uniqueCategories = [...new Set(allTechStacks)]
          .filter(tech => tech) // Filter out empty values
          .sort((a, b) => a.localeCompare(b));
        setCategories(uniqueCategories);
        
        setError(null);
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setError('Failed to load projects. Please try again later.');
      });
  }, [student_id]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!student_id) {
      setError('No student ID found. Please log in.');
      return;
    }

    const formData = new FormData();
    Object.keys(form).forEach(key => {
      if (key === 'tech_stack') {
        formData.append(key, JSON.stringify(form[key].split(',').map(t => t.trim())));
      } else {
        formData.append(key, form[key]);
      }
    });
    formData.append('student_id', student_id);

    try {
      if (editId) {
        const res = await axios.put(`http://localhost:5000/student/projects/${editId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setProjects(projects.map(p => (p._id === editId ? res.data : p)));
        setEditId(null);
      } else {
        const res = await axios.post(`http://localhost:5000/student/projects`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setProjects([res.data, ...projects]);
      }
      setForm(initialFormState());
      setShowForm(false);
      setError(null);
    } catch (err) {
      console.error('Submission error:', err);
      setError('Failed to save project. Please try again.');
    }
  };

  const handleEdit = project => {
    setForm({
      title: project.title,
      description: project.description,
      github_url: project.github_url,
      live_url: project.live_url,
      tech_stack: Array.isArray(project.tech_stack) ? project.tech_stack.join(', ') : '',
      project_image: project.image_url,
      documentation_url: project.documentation_url,
      category: project.category || 'web'
    });
    setEditId(project._id);
    setShowForm(true);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async id => {
    if (!confirm('Are you sure you want to delete this project?')) {
      return;
    }
    
    try {
      await axios.delete(`http://localhost:5000/student/projects/${id}`);
      setProjects(projects.filter(p => p._id !== id));
      setError(null);
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete project. Please try again.');
    }
  };
  
  // Filter and sort projects
  const filteredProjects = projects
    .filter(project => {
      if (filter === 'all') return true;
      return project.tech_stack && project.tech_stack.includes(filter);
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  
  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const currentProjects = filteredProjects.slice(
    (currentPage - 1) * projectsPerPage,
    currentPage * projectsPerPage
  );
  
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Project Showcase</h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <PlusCircle className="h-5 w-5" />
              Add New Project
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {showForm && (
            <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
              <h3 className="text-xl font-semibold mb-4">{editId ? 'Edit Project' : 'Add New Project'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Title*</label>
          <input
            name="title"
                      placeholder="Enter project title"
            value={form.title}
            onChange={handleChange}
            required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tech Stack*</label>
                    <input
                      name="tech_stack"
                      placeholder="e.g., React, Node.js, MongoDB"
                      value={form.tech_stack}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="web">Web Development</option>
                    <option value="mobile">Mobile App</option>
                    <option value="ai">AI/Machine Learning</option>
                    <option value="game">Game Development</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
          <textarea
            name="description"
                    placeholder="Describe your project"
            value={form.description}
            onChange={handleChange}
            required
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
          <input
            name="github_url"
                      placeholder="https://github.com/username/project"
            value={form.github_url}
            onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Live Demo URL</label>
          <input
            name="live_url"
                      placeholder="https://your-project.com"
            value={form.live_url}
            onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Image</label>
                    <input
                      type="file"
                      name="project_image"
                      accept="image/*"
                      onChange={(e) => setForm({ ...form, project_image: e.target.files[0] })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Documentation</label>
          <input
                      type="file"
                      name="documentation"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setForm({ ...form, documentation: e.target.files[0] })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setForm(initialFormState());
                      setEditId(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
        <button
          type="submit"
                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          {editId ? 'Update Project' : 'Add Project'}
        </button>
                </div>
      </form>
            </div>
          )}
          
          {/* Filter and sort controls */}
          {projects.length > 0 && (
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <button 
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 text-sm rounded-full ${
                    filter === 'all' 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {categories.slice(0, 5).map((category, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setFilter(category);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 text-sm rounded-full ${
                      filter === category 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
                {categories.length > 5 && (
                  <div className="relative group">
                    <button className="px-3 py-1.5 text-sm rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200">
                      <ListFilter className="h-4 w-4" />
                      More
                    </button>
                    <div className="absolute z-10 left-0 mt-1 w-48 bg-white rounded-md shadow-lg hidden group-hover:block">
                      <div className="py-1 max-h-48 overflow-y-auto">
                        {categories.slice(5).map((category, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setFilter(category);
                              setCurrentPage(1);
                            }}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Sort by:</label>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-md text-sm px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="title">Title (A-Z)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentProjects.map(project => (
            <div key={project._id} className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-[1.01] border border-gray-200">
              {project.image_url && (
                <img 
                  src={project.image_url} 
                  alt={project.title} 
                  className="w-full h-48 object-cover"
                />
              )}
              {!project.image_url && (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                  {project.category === 'mobile' ? (
                    <Layout className="h-16 w-16 text-gray-400" />
                  ) : project.category === 'ai' ? (
                    <Briefcase className="h-16 w-16 text-gray-400" />
                  ) : (
                    <Code className="h-16 w-16 text-gray-400" />
                  )}
                </div>
              )}
              <div className="p-5">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{project.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-3">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tech_stack.map((tech, index) => (
                    <span 
                      key={index}
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                  {project.github_url && (
                    <a 
                      href={project.github_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-blue-600 flex items-center gap-1"
                    >
                      <Github className="h-4 w-4" />
                      <span className="text-sm">GitHub</span>
              </a>
                  )}
              {project.live_url && (
                    <a 
                      href={project.live_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-green-600 flex items-center gap-1"
                    >
                      <Globe className="h-4 w-4" />
                      <span className="text-sm">Live Demo</span>
                    </a>
                  )}
                  {project.documentation_url && (
                    <a 
                      href={project.documentation_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-purple-600 flex items-center gap-1"
                    >
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">Docs</span>
                </a>
              )}
                </div>
                <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                  <button 
                    onClick={() => handleEdit(project)}
                    className="text-yellow-600 hover:text-yellow-700 p-1"
                    title="Edit Project"
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(project._id)}
                    className="text-red-600 hover:text-red-700 p-1"
                    title="Delete Project"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {filteredProjects.length > projectsPerPage && (
          <div className="flex justify-center items-center mt-8 gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`p-2 rounded-full ${
                currentPage === 1 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-primary-600 hover:bg-primary-50'
              }`}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            
            <div className="text-sm">
              Page {currentPage} of {totalPages}
            </div>
            
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-full ${
                currentPage === totalPages 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-primary-600 hover:bg-primary-50'
              }`}
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {filteredProjects.length === 0 && !showForm && (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <div className="text-gray-400 mb-4">
              <Code className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-600 mb-2">No projects found</h3>
            <p className="text-gray-500 mb-6">
              {filter !== 'all' 
                ? `No projects match the "${filter}" filter. Try a different filter.` 
                : "Start showcasing your work by adding your first project"}
            </p>
            {filter !== 'all' ? (
              <button
                onClick={() => setFilter('all')}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2"
              >
                Show All Projects
              </button>
            ) : (
              <button
                onClick={() => setShowForm(true)}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2"
              >
                <PlusCircle className="h-5 w-5" />
                Add Your First Project
              </button>
            )}
          </div>
      )}
      </div>
    </div>
  );
}
