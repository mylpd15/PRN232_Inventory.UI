import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart2,
  Settings,
  Users,
  Link2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const menu = [
  { label: 'Dashboard', path: '/overview', icon: LayoutDashboard },
  {
    label: 'Inventory',
    icon: Package,
    children: [
      { label: 'All Items', path: '/inventory' },
      { label: 'Stock Adjustments', path: '/inventory/adjustments' },
    ],
  },
  {
    label: 'Sales',
    icon: ShoppingCart,
    children: [
      { label: 'Orders', path: '/sales' },
      { label: 'Invoices', path: '/sales/invoices' },
    ],
  },
  { label: 'Purchase Orders', path: '/purchase-order', icon: ClipboardList },
  { label: 'Reports', path: '/report', icon: BarChart2 },
  { label: 'Integrations', path: '/integration', icon: Link2 },
  { label: 'Settings', path: '/settings', icon: Settings },
  { label: 'Users', path: '/users', icon: Users },
];

export default function Sidebar() {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <aside className="bg-[#1A1A1A] text-white w-60 h-full p-4 flex flex-col border-r border-gray-800">
      <div className="text-xl font-bold mb-6 px-2 text-white">WareSync</div>
      <nav className="flex flex-col gap-1">
        {menu.map((item) => {
          const isGroupActive = item.children?.some((child) => isActive(child.path));
          const Icon = item.icon;

          return item.children ? (
            <div key={item.label}>
              <button
                onClick={() => toggleMenu(item.label)}
                className={`w-full flex items-center justify-between px-4 py-2 rounded-md transition-colors duration-200
                  ${isGroupActive ? 'bg-red-500 text-white font-semibold' : 'text-gray-300 hover:bg-[#2A2A2A]'}`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} color={isGroupActive ? '#fff' : '#ccc'} />
                  <span>{item.label}</span>
                </div>
                {openMenus.includes(item.label) ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>
              <div
                className={`ml-8 overflow-hidden transition-all duration-300 ease-in-out ${
                  openMenus.includes(item.label) ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                {item.children.map((child) => (
                  <Link
                    key={child.path}
                    to={child.path}
                    className={`block text-sm px-3 py-1 rounded-md transition-all duration-200
                      ${isActive(child.path)
                        ? 'bg-yellow-300 text-white font-semibold'
                        : 'text-gray-300 hover:bg-[#2A2A2A]'}`}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors duration-200
                ${isActive(item.path)
                  ? 'bg-yellow-400 text-white font-semibold'
                  : 'text-gray-300 hover:bg-[#2A2A2A]'}`}
            >
              <item.icon size={18} color={isActive(item.path) ? '#fff' : '#ccc'} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
