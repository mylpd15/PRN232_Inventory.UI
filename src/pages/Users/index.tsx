import React, { useEffect, useState } from 'react';
import { Pencil, UserPlus, Trash, View } from 'lucide-react';
import { UserService } from '../../services/UserService';
import { AppUser, AddUserDto } from '../../interfaces/AppUser';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../services/AuthService';
import MainLayout from '../../layouts/MainLayout';
import { AxiosError } from 'axios';

export function UsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<AppUser | null>(null);
  const [form, setForm] = useState<AddUserDto>({
    displayName: '',
    username: '',
    email: '',
    userRole: 'WarehouseStaff',
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const filters: string[] = [];

      if (searchText) {
        const escaped = searchText.replace(/'/g, "''"); // escape single quotes
        filters.push(`contains(tolower(displayName), tolower('${escaped}')) or contains(tolower(email), tolower('${escaped}'))`);
      }

      if (roleFilter !== 'all') {
        filters.push(`userRole eq '${roleFilter}'`);
      }

      const filterQuery = filters.length > 0 ? { $filter: filters.join(' and ') } : {};

      const { users, count } = await UserService.getUsersOData({
        $top: pageSize,
        $skip: page * pageSize,
        $count: true,
        ...filterQuery,
      });

      setUsers(users);
      setTotalCount(count);
    } catch (error) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!AuthService.isLogin()) {
      navigate('/auth/login');
      return;
    }
    fetchUsers();
  }, [page, pageSize, roleFilter]);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "Admin":
        return <span className="bg-red-100 text-red-600 px-2 py-1 rounded-xl text-xs font-semibold">Admin</span>;
      case "WarehouseManager":
        return <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-xl text-xs font-semibold">Warehouse Manager</span>;
      case "WarehouseStaff":
        return <span className="bg-green-100 text-green-600 px-2 py-1 rounded-xl text-xs font-semibold">Warehouse Staff</span>;
      case "SalesStaff":
        return <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded-xl text-xs font-semibold">Sales Staff</span>;
      case "DeliveryStaff":
        return <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded-xl text-xs font-semibold">Delivery Staff</span>;
      case "Accountant":
        return <span className="bg-pink-100 text-pink-600 px-2 py-1 rounded-xl text-xs font-semibold">Accountant</span>;
      case "Auditor":
        return <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-xl text-xs font-semibold">Auditor</span>;
      default:
        return <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-xl text-xs font-semibold">{role}</span>;
    }
  };

  const handleAdd = () => {
    setEditUser(null);
    setForm({ displayName: '', username: '', email: '', userRole: 'WarehouseStaff' });
    setShowModal(true);
  };

  const handleEdit = (user: AppUser) => {
    setEditUser(user);
    setForm({
      displayName: user.displayName,
      username: user.username || '',
      email: user.email || '',
      userRole: String(user.userRole) || 'WarehouseStaff',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await UserService.deleteUser(id);
      fetchUsers();
    } catch {
      toast.error('Lỗi khi xóa người dùng');
    }
  };

  const handleView = (id: string) => {
    console.log('view' + id);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await UserService.addUser(form);
      setShowModal(false);
      fetchUsers();
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;

      if (axiosError.response?.data?.message) {
        toast.error(axiosError.response.data.message);
      } else {
        toast.error('An error occurred while adding the user.');
      }
    }
  };

  return (
    <MainLayout>
      <div className="p-6 bg-white rounded-xl shadow-md w-full max-w-5xl mx-auto">
        <h2 className="text-xl font-semibold mb-6">User Management</h2>
        <div className="flex justify-end items-center mb-6 gap-2">
          <input
            type="text"
            placeholder="Search by name or email"
            className="border px-3 py-2 rounded-2xl w-[400px] flex-1"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                fetchUsers(); // chỉ gọi API khi nhấn Enter
              }
            }}
          />
          <select
            className="border px-3 py-2 w-[180px] rounded-2xl"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="Admin">Admin</option>
            <option value="WarehouseManager">Warehouse Manager</option>
            <option value="WarehouseStaff">Warehouse Staff</option>
            <option value="SalesStaff">Sales Staff</option>
            <option value="DeliveryStaff">Delivery Staff</option>
            <option value="Accountant">Accountant</option>
            <option value="Auditor">Auditor</option>
          </select>

          <button
            className="bg-yellow-600 text-white px-4 py-2 rounded-2xl hover:bg-yellow-700 flex items-center gap-1"
            onClick={handleAdd}
          >
            <UserPlus size={16} /> Add User
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-3">
              <thead>
                <tr className="text-gray-600 text-sm bg-gray-100">
                  <th className="pl-3"> </th>
                  <th className="px-3">NAME</th>
                  <th className="px-3">EMAIL</th>
                  <th className="px-3">ROLE</th>
                  <th className="px-3">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      No users matching your search criteria.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const isSelected = selected === user.id;
                    return (
                      <tr
                        key={user.id}
                        className={`bg-white hover:bg-gray-100 rounded-lg shadow-sm ${isSelected ? 'ring-2 ring-indigo-300' : ''}`}
                        onClick={() => setSelected(user.id)}
                      >
                        <td className="pl-3">
                          <input type="radio" checked={isSelected} onChange={() => setSelected(user.id)} />
                        </td>
                        <td className="px-3 py-3">{user.displayName}</td>
                        <td className="px-3">{user.email}</td>
                        <td className="px-3">{getRoleBadge(user.userRole)}</td>
                        <td className="px-3 flex items-center gap-3 py-3">
                          <View size={16} className="text-gray-500 cursor-pointer hover:text-purple-600" onClick={() => handleView(user.id)} />
                          <Pencil size={16} className="text-gray-500 cursor-pointer hover:text-purple-600" onClick={() => handleEdit(user)} />
                          <Trash size={16} className="text-gray-500 cursor-pointer hover:text-purple-600" onClick={() => handleDelete(user.id)} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                disabled={page === 0}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >Previous</button>
              <span>
                Page {page + 1} / {Math.ceil(totalCount / pageSize)}
              </span>
              <button
                onClick={() => setPage((prev) => prev + 1)}
                disabled={(page + 1) * pageSize >= totalCount}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >Next</button>
            </div>
            <select
              className="border px-3 py-2 w-[140px] rounded-2xl mt-5"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(0);
              }}
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">{editUser ? 'Edit User' : 'Add User'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block mb-1">Display Name</label>
                  <input
                    className="w-full border px-3 py-2 rounded"
                    name="displayName"
                    value={form.displayName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1">Username</label>
                  <input
                    className="w-full border px-3 py-2 rounded"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1">Email</label>
                  <input
                    className="w-full border px-3 py-2 rounded"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    type="email"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1">Role</label>
                  <select
                    className="w-full border px-3 py-2 rounded"
                    name="userRole"
                    value={form.userRole}
                    onChange={handleChange}
                  >
                    <option value="Admin">Admin</option>
                    <option value="WarehouseManager">Warehouse Manager</option>
                    <option value="WarehouseStaff">Warehouse Staff</option>
                    <option value="SalesStaff">Sales Staff</option>
                    <option value="DeliveryStaff">Delivery Staff</option>
                    <option value="Accountant">Accountant</option>
                    <option value="Auditor">Auditor</option>
                  </select>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="mr-2 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                    onClick={() => setShowModal(false)}
                  >Cancel</button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-yellow-500 text-white hover:bg-yellow-600"
                  >Save</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}