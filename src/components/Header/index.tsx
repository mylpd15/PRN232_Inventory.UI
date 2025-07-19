import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../services/AuthService';
import { toast } from 'react-hot-toast';

export default function Header() {
  const navigate = useNavigate();
  const isLogin = AuthService.isLogin();

  const handleLogout = () => {
    AuthService.logout();
    toast.success('Đã đăng xuất!');
    navigate('/auth/login');
  };

  return (
    <header className="flex items-center justify-between h-16 px-8 bg-white border-b">
      <div className="flex-1">
        <input
          type="text"
          placeholder="Search for product, order, transaction"
          className="w-96 px-4 py-2 rounded-lg border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-200"
        />
      </div>
      <div className="flex items-center gap-4">
        <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-yellow-700 transition">Add product</button>
        <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition">Inventory transfer</button>
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-yellow-400">
          <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="avatar" className="w-full h-full object-cover" />
        </div>
        {isLogin ? (
          <button
            className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition"
            onClick={handleLogout}
          >
            Log out
          </button>
        ) : (
          <button
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition"
            onClick={() => navigate('/auth/login')}
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
} 