import { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const createProject = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/projects', form);
      setForm({ name: '', description: '' });
      setShowForm(false);
      fetchProjects();
    } catch (err) { setError(err.response?.data?.message || 'Failed to create project'); }
  };

  const deleteProject = async (id) => {
    if (!confirm('Delete this project?')) return;
    try { await api.delete(`/projects/${id}`); fetchProjects(); } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
          {user?.role === 'admin' && (
            <button onClick={() => setShowForm(!showForm)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
              + New Project
            </button>
          )}
        </div>
        {showForm && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <h2 className="font-medium text-gray-900 mb-4">Create new project</h2>
            {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
            <form onSubmit={createProject} className="space-y-4">
              <input required placeholder="Project name" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
              <textarea placeholder="Description (optional)" value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" rows={2}/>
              <div className="flex gap-3">
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">Create</button>
                <button type="button" onClick={() => setShowForm(false)} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">Cancel</button>
              </div>
            </form>
          </div>
        )}
        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="text-center text-gray-400 py-12">No projects yet</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(project => (
              <div key={project.id} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{project.name}</h3>
                  {user?.role === 'admin' && (
                    <button onClick={() => deleteProject(project.id)} className="text-gray-300 hover:text-red-400 text-xs ml-2">✕</button>
                  )}
                </div>
                {project.description && <p className="text-sm text-gray-500 mb-3">{project.description}</p>}
                <p className="text-xs text-gray-400">Owner: {project.owner_name}</p>
                <p className="text-xs text-gray-400 mt-0.5">Created {new Date(project.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;