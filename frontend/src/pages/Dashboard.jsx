import { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ todo: 0, in_progress: 0, done: 0, overdue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/tasks');
        setTasks(data);
        const today = new Date().toISOString().split('T')[0];
        setStats({
          todo: data.filter(t => t.status === 'todo').length,
          in_progress: data.filter(t => t.status === 'in_progress').length,
          done: data.filter(t => t.status === 'done').length,
          overdue: data.filter(t => t.due_date && t.due_date < today && t.status !== 'done').length,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { label: 'To Do', value: stats.todo, color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { label: 'In Progress', value: stats.in_progress, color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    { label: 'Done', value: stats.done, color: 'bg-green-50 text-green-700 border-green-200' },
    { label: 'Overdue', value: stats.overdue, color: 'bg-red-50 text-red-700 border-red-200' },
  ];

  const priorityColors = { high: 'text-red-600', medium: 'text-yellow-600', low: 'text-green-600' };
  const statusColors = { todo: 'bg-gray-100 text-gray-700', in_progress: 'bg-blue-100 text-blue-700', done: 'bg-green-100 text-green-700' };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, {user?.name}</p>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-8">
          {statCards.map(card => (
            <div key={card.label} className={`border rounded-xl p-5 ${card.color}`}>
              <p className="text-3xl font-bold">{card.value}</p>
              <p className="text-sm mt-1 font-medium">{card.label}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-medium text-gray-900">Recent Tasks</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No tasks yet</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {tasks.slice(0, 10).map(task => (
                <div key={task.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{task.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{task.project_name} {task.assignee_name ? `· ${task.assignee_name}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {task.due_date && (
                      <span className={`text-xs ${new Date(task.due_date) < new Date() && task.status !== 'done' ? 'text-red-500' : 'text-gray-400'}`}>
                        Due {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    )}
                    <span className={`text-xs font-medium ${priorityColors[task.priority]}`}>{task.priority}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[task.status]}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;