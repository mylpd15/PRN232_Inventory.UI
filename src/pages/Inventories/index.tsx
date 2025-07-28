// src/pages/Inventories/index.tsx
import React, { useEffect, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import axios from 'axios';
import {
  getInventories,
  createInventory,
  updateInventory,
  deleteInventory,
  Inventory,
} from '../../services/InventoryService';
import { toast } from 'react-hot-toast';
import { Search, Edit, Trash, Plus } from 'lucide-react';

const defaultForm: Omit<Inventory, 'InventoryID' | 'ProductName' | 'WarehouseName' | 'InventoryLogs'> = {
  QuantityAvailable: 0,
  MinimumStockLevel: 0,
  MaximumStockLevel: 0,
  ReorderPoint: 0,
  ProductID: 0,
  WarehouseID: 0,
};

export function InventoriesPage() {
  const [all, setAll] = useState<Inventory[]>([]);
  const [list, setList] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Inventory | null>(null);
  const [form, setForm] = useState(defaultForm);

  const [showDelete, setShowDelete] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const perPage = 5;
  const totalPages = Math.ceil(list.length / perPage);
  const paged = list.slice((page - 1) * perPage, page * perPage);

  // Fetch
  const load = async () => {
    setLoading(true);
    try {
      const data = await getInventories(50, 0);
      setAll(data);
      setList(data);
    } catch {
      toast.error('Cannot load inventories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Search
  useEffect(() => {
    const f = all.filter(inv =>
      inv.ProductName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.WarehouseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.InventoryID?.toString().includes(searchTerm)
    );
    setList(f);
    setPage(1);
  }, [searchTerm, all]);

  // Handlers
  const handleAdd = () => {
    setEditing(null);
    setForm(defaultForm);
    setShowModal(true);
  };
  const handleEdit = (inv: Inventory) => {
    setEditing(inv);
    setForm({
      QuantityAvailable: inv.QuantityAvailable,
      MinimumStockLevel: inv.MinimumStockLevel,
      MaximumStockLevel: inv.MaximumStockLevel,
      ReorderPoint: inv.ReorderPoint,
      ProductID: inv.ProductID,
      WarehouseID: inv.WarehouseID,
    });
    setShowModal(true);
  };
  const handleDelete = (id: number) => {
    setDeletingId(id);
    setShowDelete(true);
  };

  const onSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    if (editing) {
      await updateInventory(editing.InventoryID!, form);
      toast.success('Inventory updated successfully');
    } else {
      await createInventory(form);
      toast.success('Inventory created successfully');
    }
    setShowModal(false);
    load();
  } catch (err: unknown) {
    let msg = 'Quantity must be between MinimumStockLevel and MaximumStockLevel';
    if (axios.isAxiosError(err) && err.response?.data?.message) {
      msg = err.response.data.message as string;
    }
    toast.error(msg);
  }
};
  const onConfirmDelete = async () => {
    if (deletingId == null) return;
    try {
      await deleteInventory(deletingId);
      toast.success('Deleted successfully');
      setShowDelete(false);
      load();
    } catch {
      toast.error('Error deleting data');
    }
  };

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventories</h1>
        <button
          className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          onClick={handleAdd}
        >
          <Plus size={16} /> Add Inventory
        </button>
      </div>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Find by product, warehouse..."
            className="pl-10 pr-4 py-2 border rounded w-full"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >✕</button>
          )}
        </div>
      </div>

      {loading
        ? <div className="text-center py-10">Loading…</div>
        : (
          <>
            {paged.length === 0
              ? (
                <div className="text-center py-10">
                  No inventories found
                </div>
              )
              : (
                <table className="w-full border-collapse bg-white shadow rounded">
                  <thead>
                    <tr className="bg-gray-100">
                      {['Product', 'Warehouse', 'Quantity', 'History Logs', 'Actions'].map(h => (
                        <th key={h} className="border px-2 py-1 text-center">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map(inv => (
                      <tr key={inv.InventoryID} className="even:bg-gray-50">
                        {/* <td className="border px-2 py-1 text-center">
                          {inv.InventoryID}
                        </td> */}
                        <td className="border px-2 py-1 text-center">
                          {inv.ProductName}
                        </td>
                        <td className="border px-2 py-1 text-center">
                          {inv.WarehouseName}
                        </td>
                        <td className="border px-2 py-1 text-center">
                          {inv.QuantityAvailable}
                        </td>
                        <td className="border px-2 py-1 text-sm">
                          {inv.InventoryLogs && inv.InventoryLogs.length > 0
                            ? inv.InventoryLogs.map(l => (
                              <div key={l.LogID} className="mb-2">
                                <div>
                                  <strong>{l.ActionType}</strong>: {l.Description}
                                </div>
                                {/* <div className="text-xs text-gray-500">
                                  {l.CreatedAt && (
                                    new Date(l.CreatedAt)
                                      .toLocaleString('vi-VN', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })
                                  )}
                                </div> */}
                              </div>
                            ))
                            : <span className="text-xs text-gray-500">Chưa có log</span>
                          }
                        </td>
                        <td className="border px-2 py-1 text-center">
                          <button
                            onClick={() => handleEdit(inv)}
                            className="mx-1 text-blue-600 hover:text-blue-800"
                            title="Chỉnh sửa"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(inv.InventoryID!)}
                            className="mx-1 text-red-600 hover:text-red-800"
                            title="Xóa"
                          >
                            <Trash size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            }


            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-4 space-x-2">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 bg-gray-200 rounded">Prev</button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i} onClick={() => setPage(i + 1)}
                    className={`px-3 py-1 rounded ${page === i + 1 ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}
                  >{i + 1}</button>
                ))}
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 bg-gray-200 rounded">Next</button>
              </div>
            )}
          </>
        )
      }

      {/* Modal Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editing ? 'Adjustment Inventory' : 'Add Inventory'}
            </h2>
            <form onSubmit={onSubmit} className="space-y-4">
              {/** ProductID */}
              <div>
                <label>Product(ID)</label>
                <input
                  type="number" name="ProductID"
                  value={form.ProductID}
                  onChange={e => setForm({ ...form, ProductID: +e.target.value })}
                  className="w-full border px-2 py-1 rounded"
                  required
                />
              </div>
              {/** WarehouseID */}
              <div>
                <label>Inventory(ID)</label>
                <input
                  type="number" name="WarehouseID"
                  value={form.WarehouseID}
                  onChange={e => setForm({ ...form, WarehouseID: +e.target.value })}
                  className="w-full border px-2 py-1 rounded"
                  required
                />
              </div>
              {/** QuantityAvailable */}
              <div>
                <label>Quantity Available</label>
                <input
                  type="number" name="QuantityAvailable"
                  value={form.QuantityAvailable}
                  onChange={e => setForm({ ...form, QuantityAvailable: +e.target.value })}
                  className="w-full border px-2 py-1 rounded"
                  required
                />
              </div>
              {/** MinimumStockLevel */}
              <div>
                <label>Minimum Stock Level</label>
                <input
                  type="number" name="MinimumStockLevel"
                  value={form.MinimumStockLevel}
                  onChange={e => setForm({ ...form, MinimumStockLevel: +e.target.value })}
                  className="w-full border px-2 py-1 rounded"
                  required
                />
              </div>
              {/** MaximumStockLevel */}
              <div>
                <label>Maximum Stock Level</label>
                <input
                  type="number" name="MaximumStockLevel"
                  value={form.MaximumStockLevel}
                  onChange={e => setForm({ ...form, MaximumStockLevel: +e.target.value })}
                  className="w-full border px-2 py-1 rounded"
                  required
                />
              </div>
              {/** ReorderPoint */}
              <div>
                <label>Reorder Point</label>
                <input
                  type="number" name="ReorderPoint"
                  value={form.ReorderPoint}
                  onChange={e => setForm({ ...form, ReorderPoint: +e.target.value })}
                  className="w-full border px-2 py-1 rounded"
                  required
                />
              </div>
              {/** các trường khác tương tự… */}
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-yellow-500 text-white rounded">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Delete */}
      {showDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete this inventory?</p>
            <div className="flex justify-end space-x-2 mt-4">
              <button onClick={() => setShowDelete(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
              <button onClick={onConfirmDelete} className="px-4 py-2 bg-red-500 text-white rounded">Delete</button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
