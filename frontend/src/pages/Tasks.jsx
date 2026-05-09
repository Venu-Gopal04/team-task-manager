import { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const statusColors = { todo: 'bg-gray-100 text-gray-700', in_progress: 'bg-blue-100 text-blue-700', done: 'bg-green-100 text-green-700' };
const priorityColors = { high: 'text-red-500', medium: 'text-yellow-500', low: 'text-green-500' };

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [form, setForm] = useState({ title: '', description: '', projectId: '', assigneeId: '', dueDate: '', priority: 'medium' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
    fetchProjects();
    if (user?.role === 'admin') fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try { const { data } = await api.get('/tasks'); setTasks(data); } catch (err) { console.error(err); } finally { setLoading(false); }
  };
  const fetchProjects = async () => {
    try { const { data } = await api.get('/projects'); setProjects(data); } catch (err) { console.error(err); }
  };
  const fetchUsers = async () => {
    try { const { data } = await api.get('/users'); setUsers(data); } catch (err) { console.error(err); }
  };

  const createTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', { ...form, projectId: parseInt(form.projectId), assigneeId: form.assigneeId ? parseInt(form.assigneeId) : null });
      setForm({ title: '', description: '', projectId: '', assigneeId: '', dueDate: '', priority: 'medium' });
      setShowForm(false);
      fetchTasks();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const updateStatus = async (taskId, status) => {
    try { await api.patch(`/tasks/${taskId}/status`, { status }); fetchTasks(); } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const deleteTask = async (id) => {
    if (!confirm('Delete this task?')) return;
    try { await api.delete(`/tasks/${id}`); fetchTasks(); } catch (err) { console.error(err); }
  };

  const filtered = filterStatus === 'all' ? tasks : tasks.filter(t => t.status === filterStatus);
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Tasks</h1>
          {user?.role === 'admin' && (
            <button onClick={() => setShowForm(!showForm)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
              + New Task
            </button>
          )}
        </div>
        {showForm && user?.role === 'admin' && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <h2 className="font-medium text-gray-900 mb-4">Create task</h2>
            <form onSubmit={createTask} className="grid grid-cols-2 gap-4">
              <input required placeholder="Task title" value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                className="col-span-2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
              <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                className="col-span-2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" rows={2}/>
              <select required value={form.projectId} onChange={e => setForm({...form, projectId: e.target.value})}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select value={form.assigneeId} onChange={e => setForm({...form, assigneeId: e.target.value})}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Unassigned</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
              <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="low">Low priority</option>
                <option value="medium">Medium priority</option>
                <option value="high">High priority</option>
              </select>
              <div className="col-span-2 flex gap-3">
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">Create task</button>
                <button type="button" onClick={() => setShowForm(false)} className="text-sm text-gray-500 px-4 py-2">Cancel</button>
              </div>
            </form>
          </div>
        )}
        <div className="flex gap-2 mb-4">
          {['all', 'todo', 'in_progress', 'done'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterStatus === s ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
              {s === 'all' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading tasks...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-400 py-12">No tasks found</div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-50">
            {filtered.map(task => (
              <div key={task.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">{task.title}</p>
                    <span className={`text-xs font-medium ${priorityColors[task.priority]}`}>● {task.priority}</span>
                    {task.due_date && task.due_date < today && task.status !== 'done' && (
                      <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">Overdue</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {task.project_name} {task.assignee_name ? `· ${task.assignee_name}` : ''}
                    {task.due_date ? ` · Due ${new Date(task.due_date).toLocaleDateString()}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <select value={task.status} onChange={e => updateStatus(task.id, e.target.value)}
                    className={`text-xs font-medium px-2 py-1 rounded-full border-0 focus:outline-none cursor-pointer ${statusColors[task.status]}`}>
                    <option value="todo">To do</option>
                    <option value="in_progress">In progress</option>
                    <option value="done">Done</option>
                  </select>
                  {user?.role === 'admin' && (
                    <button onClick={() => deleteTask(task.id)} className="text-gray-300 hover:text-red-400 text-xs">✕</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;