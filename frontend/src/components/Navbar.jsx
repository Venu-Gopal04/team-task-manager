import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link to="/dashboard" className="font-semibold text-indigo-600 text-lg">TaskFlow</Link>
        <Link to="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">Dashboard</Link>
        <Link to="/projects" className="text-sm text-gray-600 hover:text-gray-900">Projects</Link>
        <Link to="/tasks" className="text-sm text-gray-600 hover:text-gray-900">Tasks</Link>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">
          {user?.name}
          <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${user?.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
            {user?.role}
          </span>
        </span>
        <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700">Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;