import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const menu = [
  { label: 'Overview', path: '/overview', icon: '🏠' },
  { label: 'Product', path: '/products', icon: '📦' },
  { label: 'Sales', path: '/sales', icon: '💰' },
  { label: 'Inventory', path: '/inventory', icon: '📊' },
  { label: 'Purchase order', path: '/purchase-order', icon: '📝' },
  { label: 'Report', path: '/report', icon: '📈' },
  { label: 'Customers', path: '/customers', icon: '👤' },
  { label: 'Deliveries', path: '/deliveries', icon: '🚚' },
  { label: 'Integration', path: '/integration', icon: '🔗' },
  { label: 'Settings', path: '/settings', icon: '⚙️' },
  { label: 'Users', path: '/users', icon: '👥' },
];

export default function Sidebar() {
  const location = useLocation();
  return (
    <aside className="bg-white h-full w-60 p-6 flex flex-col border-r">
      <div className="font-bold text-xl mb-8">Home rush</div>
      <nav className="flex flex-col gap-2">
        {menu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              location.pathname.startsWith(item.path)
                ? 'bg-yellow-100 text-yellow-700 font-semibold'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
} 