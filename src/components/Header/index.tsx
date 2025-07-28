import { useNavigate } from "react-router-dom";
import { AuthService } from "../../services/AuthService";
import { toast } from "react-hot-toast";

import {
  Bell,
  Settings,
  Menu,
  Plus,
} from "lucide-react";

export default function Header({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const navigate = useNavigate();
  const isLogin = AuthService.isLogin();
  const user = AuthService.getCurrentUser();
  const handleLogout = () => {
    AuthService.logout();
    toast.success("Đã đăng xuất!");
    navigate("/auth/login");
  };

  const handleProfile = () => {
    navigate("/auth/profile"); // 👈 thay bằng đường dẫn bạn muốn
  };

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200 shadow-sm cursor-pointer">
      {/* Left side: Menu button + Search bar */}
      <div className="flex items-center gap-4">
        {/* Sidebar Toggle */}
        <button
          className="p-2 rounded-md hover:bg-gray-100"
          onClick={onToggleSidebar}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search"
          className="w-72 px-3 py-2 rounded-md border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 text-sm"
        />
      </div>

      {/* Right side: Action buttons */}
      <div className="flex items-center gap-4">
        <button className="bg-yellow-500 hover:bg-red-600 p-2 rounded-full text-white transition">
          <Plus className="w-4 h-4" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-full transition">
          <Bell className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-full transition">
          <Settings className="w-5 h-5 text-gray-600" />
        </button>
        <div 
          className="w-9 h-9 rounded-full overflow-hidden border-2 border-yellow-400"
          onClick={handleProfile}>
          <img
            src="https://i.pinimg.com/originals/31/76/c7/3176c7df8c823b24e668f26f1612b75a.jpg"
            alt="avatar"
            className="w-full h-full object-cover"
          />
        </div>
            {user?.displayName}
        {isLogin ? (
          <button
            className="px-4 py-2 text-sm rounded-md bg-yellow-500 text-white font-semibold hover:bg-yellow-600 transition"
            onClick={handleLogout}
          >
            Log out
          </button>
        ) : (
          <button
            className="px-4 py-2 text-sm rounded-md bg-yellow-500 text-white font-semibold hover:bg-yellow-600 transition"
            onClick={() => navigate("/auth/login")}
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
}
