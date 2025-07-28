import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart2,
  Users,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  UserRound,
  Truck,
  Warehouse,
  Turtle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { UserRole } from '../../common/enums/AppUser/UserRole';

interface User {
  $id: string;
  id: string;
  displayName: string;
  username: string;
  email: string | null;
  isDisabled: boolean;
  userRole: number;
}

const menu = [
  { label: "Dashboard", path: "/overview", icon: LayoutDashboard },
  {
    label: "Inventory",
    icon: Package,
    children: [
      { label: "All Items", path: "/inventory" },
      { label: "Stock Adjustments", path: "/inventory/adjustments" },
    ],
  },
  {
    label: "Sales",
    icon: ShoppingCart,
    children: [
      { label: "Orders", path: "/sales" },
      { label: "Invoices", path: "/sales/invoices" },
    ],
  },
  {
    label: 'Warehouse',
    icon: Warehouse,
    children: [
      { label: 'Location', path: '/locations' },
      { label: 'Warehouse', path: '/warehouses' },
    ],
  },
  { label: 'Purchase Orders', path: '/purchase-order', icon: ClipboardList },
  { label: 'Reports', path: '/report', icon: BarChart2 },
  { label: 'Customers', path: '/customers', icon: UserRound },
  { label: 'Deliveries', path: '/deliveries', icon: Truck },
  { label: 'Users', path: '/users', icon: Users },
];

export default function Sidebar() {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Get current user from localStorage
  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson) as User;
        setCurrentUser(user);
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
      }
    }
  }, []);

  // Filter menu items based on user role
  const getFilteredMenu = () => {
    if (!currentUser) return [];

    const userRole = currentUser.userRole;

    return menu.filter(item => {
      // Admin (1) - can access everything
      if (userRole === UserRole.Admin) {
        return true;
      }

      // WarehouseManager (2) - can access all except add/edit/delete customers
      if (userRole === UserRole.WarehouseManager) {
        return true;
      }

      // WarehouseStaff (3) - can access Customer, Deliveries, Inventory, Dashboard (view only)
      if (userRole === UserRole.WarehouseStaff) {
        return ['Dashboard', 'Customers', 'Deliveries', 'Inventory'].includes(item.label);
      }

      // SalesStaff (4) - can manage inventory, manage sales
      if (userRole === UserRole.SalesStaff) {
        return ['Dashboard', 'Inventory', 'Sales'].includes(item.label);
      }

      // DeliveryStaff (5) - can view only deliveries
      if (userRole === UserRole.DeliveryStaff) {
        return ['Dashboard', 'Deliveries'].includes(item.label);
      }

      // Accountant (6) - can manage inventory, manage sales and view deliveries
      if (userRole === UserRole.Accountant) {
        return ['Dashboard', 'Inventory', 'Sales', 'Deliveries'].includes(item.label);
      }

      // Auditor (7) - can view all but view only
      if (userRole === UserRole.Auditor) {
        return ['Dashboard', 'Customers', 'Deliveries', 'Inventory', 'Sales'].includes(item.label);
      }

      return false;
    });
  };

  // Check if Reports tab should be disabled (only Admin and WarehouseManager)
  const isReportsDisabled = () => {
    if (!currentUser) return true;
    return currentUser.userRole !== UserRole.Admin && currentUser.userRole !== UserRole.WarehouseManager;
  };

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const filteredMenu = getFilteredMenu();

  return (
    <aside className="bg-[#1A1A1A] text-white w-60 h-full p-4 flex flex-col border-r border-gray-800">
      <div className="text-xl font-bold mb-6 px-2 text-white">WareSync</div>
      <nav className="flex flex-col gap-1">
        {filteredMenu.map((item) => {
          const isGroupActive = item.children?.some((child) => isActive(child.path));
          const Icon = item.icon;
          const isDisabled = item.label === 'Reports' && isReportsDisabled();

          return item.children ? (
            <div key={item.label}>
              <button
                onClick={() => toggleMenu(item.label)}
                disabled={isDisabled}
                className={`w-full flex items-center justify-between px-4 py-2 rounded-md transition-colors duration-200
                  ${isGroupActive ? 'bg-red-500 text-white font-semibold' : 'text-gray-300 hover:bg-[#2A2A2A]'}
                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} color={isGroupActive ? "#fff" : "#ccc"} />
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
                  openMenus.includes(item.label)
                    ? "max-h-40 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                {item.children.map((child) => (
                  <Link
                    key={child.path}
                    to={child.path}
                    className={`block text-sm px-3 py-1 rounded-md transition-all duration-200
                      ${
                        isActive(child.path)
                          ? "bg-yellow-300 text-white font-semibold"
                          : "text-gray-300 hover:bg-[#2A2A2A]"
                      }`}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <Link
              key={item.path}
              to={isDisabled ? '#' : item.path}
              className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors duration-200
                ${isActive(item.path)
                  ? 'bg-yellow-400 text-white font-semibold'
                  : 'text-gray-300 hover:bg-[#2A2A2A]'}
                ${isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
            >
              <item.icon
                size={18}
                color={isActive(item.path) ? "#fff" : "#ccc"}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
