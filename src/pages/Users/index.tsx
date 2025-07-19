import React, { useEffect, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { UserService } from '../../services/UserService';
import { AppUser, AddUserDto } from '../../interfaces/AppUser';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../services/AuthService';

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
  const [message, setMessage] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data: unknown = await UserService.getUsers();
      if (data && typeof data === 'object' && Array.isArray((data as { value?: AppUser[] }).value)) {
        setUsers((data as { value: AppUser[] }).value);
      } else if (Array.isArray(data)) {
        setUsers(data as AppUser[]);
      } else {
        setUsers([]);
      }
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
  }, []);

  const handleAdd = () => {
    setEditUser(null);
    setForm({ displayName: '', username: '', email: '', userRole: 'WarehouseStaff' });
    setShowModal(true);
    setMessage(null);
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
    setMessage(null);
  };

  const handleDelete = (id: string) => {
    // TODO: Xử lý xóa user
    setUsers(users.filter(u => u.id !== id));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await UserService.addUser(form);
      setMessage('Thêm người dùng thành công!');
      setShowModal(false);
      fetchUsers();
    } catch (error: unknown) {
      // Hiển thị lỗi chi tiết từ backend nếu có
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as any).response === 'object' &&
        (error as any).response.data &&
        (error as any).response.data.message
      ) {
        toast.error((error as any).response.data.message);
      } else {
        toast.error('Có lỗi xảy ra khi thêm người dùng.');
      }
      setMessage('Có lỗi xảy ra khi thêm người dùng.');
    }
  };

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
        <button
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
          onClick={handleAdd}
        >
          Thêm người dùng
        </button>
      </div>
      {message && <div className="mb-4 text-center text-red-500">{message}</div>}
      {loading ? (
        <div className="text-center py-10">Đang tải danh sách người dùng...</div>
      ) : (
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Tên</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Vai trò</th>
              <th className="py-2 px-4 border-b">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td className="py-2 px-4 border-b">{user.id}</td>
                <td className="py-2 px-4 border-b">{user.displayName}</td>
                <td className="py-2 px-4 border-b">{user.email}</td>
                <td className="py-2 px-4 border-b">{user.userRole}</td>
                <td className="py-2 px-4 border-b">
                  <button
                    className="text-blue-500 hover:underline mr-2"
                    onClick={() => handleEdit(user)}
                  >Sửa</button>
                  <button
                    className="text-red-500 hover:underline"
                    onClick={() => handleDelete(user.id)}
                  >Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editUser ? 'Sửa người dùng' : 'Thêm người dùng'}</h2>
            {/* Form thêm/sửa user */}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-1">Tên hiển thị</label>
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
                <label className="block mb-1">Vai trò</label>
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
                >Hủy</button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-yellow-500 text-white hover:bg-yellow-600"
                >Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
} 