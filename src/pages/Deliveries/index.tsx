import React, { useEffect, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { useParams } from 'react-router-dom';
import {
  getDeliveriesByCustomer,
  createDelivery,
  updateDelivery,
  Delivery,
} from '../../services/DeliveryService';
import { toast } from 'react-hot-toast';

interface Product {
  productID: number;
  productName: string;
}

const defaultForm: Omit<Delivery, 'DeliveryID'> = {
  SalesDate: '',
  CustomerID: 0,
  deliveryDetails: [],
};

interface DeliveryDetailForm {
  productID: number;
  deliveryQuantity: number;
  expectedDate: string;
}

interface DeliveryForm {
  SalesDate: string;
  CustomerID: number;
  deliveryDetails: DeliveryDetailForm[];
}

interface DeliveryDetailPayload {
  productID: number;
  deliveryQuantity: number;
  expectedDate: string;
}

interface CustomerOption {
  CustomerID: number;
  CustomerName: string;
}

const DeliveriesPage: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editDelivery, setEditDelivery] = useState<Delivery | null>(null);
  const [form, setForm] = useState<DeliveryForm>({ ...defaultForm, deliveryDetails: [] });
  // const [showDeleteModal, setShowDeleteModal] = useState(false);
  // const [deleteDeliveryId, setDeleteDeliveryId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(deliveries.length / itemsPerPage);
  const paginatedDeliveries = deliveries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      let data;
      if (customerId) {
        data = await getDeliveriesByCustomer(customerId);
      } else {
        // Fetch all deliveries
        const res = await fetch('https://localhost:7136/odata/Deliveries', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        data = await res.json();
      }
      setDeliveries(Array.isArray(data.value) ? data.value : []);
    } catch (error) {
      setDeliveries([]);
      toast.error('Failed to fetch deliveries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
    setCurrentPage(1); // Reset to first page on data reload
    // Fetch products for dropdown
    fetch('https://localhost:7136/odata/Products', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch(() => setProducts([]));
    // Fetch customers for dropdown
    fetch('https://localhost:7136/odata/Customers', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setCustomers(Array.isArray(data.value) ? data.value : []);
      })
      .catch(() => setCustomers([]));
  }, [customerId]);

  const handleAdd = () => {
    setEditDelivery(null);
    setForm({
      ...defaultForm,
      CustomerID: Number(customerId),
      deliveryDetails: [],
      SalesDate: '',
    });
    setShowModal(true);
  };

  const handleEdit = (delivery: Delivery) => {
    setEditDelivery(delivery);
    setForm({
      SalesDate: delivery.SalesDate,
      CustomerID: delivery.CustomerID,
      deliveryDetails: Array.isArray(delivery.deliveryDetails) ? delivery.deliveryDetails.map((d: any) => ({
        productID: d.productID,
        deliveryQuantity: d.deliveryQuantity,
        expectedDate: d.expectedDate || '',
      })) : [],
    });
    setShowModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDetailChange = (idx: number, field: keyof DeliveryDetailForm, value: unknown) => {
    const details: DeliveryDetailForm[] = Array.isArray(form.deliveryDetails) ? [...form.deliveryDetails] : [];
    details[idx] = { ...details[idx], [field]: value };
    setForm({ ...form, deliveryDetails: details });
  };

  const handleAddDetail = () => {
    setForm((prev) => ({
      ...prev,
      deliveryDetails: [...(Array.isArray(prev.deliveryDetails) ? prev.deliveryDetails : []), { productID: 0, deliveryQuantity: 1, expectedDate: '' }],
    }));
  };

  const handleRemoveDetail = (idx: number) => {
    setForm((prev) => {
      const details: DeliveryDetailForm[] = Array.isArray(prev.deliveryDetails) ? [...prev.deliveryDetails] : [];
      details.splice(idx, 1);
      return { ...prev, deliveryDetails: details };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitForm = {
        SalesDate: form.SalesDate,
        CustomerID: form.CustomerID,
        deliveryDetails: form.deliveryDetails.map((d: DeliveryDetailForm): DeliveryDetailPayload => ({
          productID: Number(d.productID),
          deliveryQuantity: Number(d.deliveryQuantity),
          expectedDate: d.expectedDate || '',
        })),
      };
      if (editDelivery) {
        await updateDelivery(editDelivery.DeliveryID!, submitForm);
        toast.success('Delivery updated successfully');
      } else {
        await createDelivery(submitForm);
        toast.success('Delivery created successfully');
      }
      setShowModal(false);
      fetchDeliveries();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save delivery');
    }
  };

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {customerId ? `Deliveries for Customer ${customerId}` : 'All Deliveries'}
        </h1>
        <div className="flex gap-2">
          <button
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
            onClick={handleAdd}
          >
            Add Delivery
          </button>
        </div>
      </div>
      {loading ? (
        <div className="text-center py-10">Loading deliveries...</div>
      ) : (
        <>
          <div className="flex justify-center w-full">
            <table className="w-full min-w-full bg-white rounded shadow my-4">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b text-center">DeliveryID</th>
                  <th className="py-2 px-4 border-b text-center">SalesDate</th>
                  <th className="py-2 px-4 border-b text-center">Status</th>
                  <th className="py-2 px-4 border-b text-center">CreatedDate</th>
                  <th className="py-2 px-4 border-b text-center">UpdatedDate</th>
                  <th className="py-2 px-4 border-b text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDeliveries.map((delivery) => (
                  <tr key={delivery.DeliveryID}>
                    <td className="py-2 px-4 border-b text-center">{delivery.DeliveryID}</td>
                    <td className="py-2 px-4 border-b text-center">{delivery.SalesDate ? new Date(delivery.SalesDate).toLocaleString() : ''}</td>
                    <td className="py-2 px-4 border-b text-center">{delivery.Status}</td>
                    <td className="py-2 px-4 border-b text-center">{delivery.CreatedDate ? new Date(delivery.CreatedDate).toLocaleString() : ''}</td>
                    <td className="py-2 px-4 border-b text-center">{delivery.UpdatedDate ? new Date(delivery.UpdatedDate).toLocaleString() : ''}</td>
                    <td className="py-2 px-4 border-b flex gap-2 justify-center text-center">
                      <button
                        className="text-blue-500 hover:underline mr-2"
                        onClick={() => handleEdit(delivery)}
                      >Edit</button>
                      {/* <button
                        className="text-red-500 hover:underline"
                        onClick={() => handleDelete(delivery.DeliveryID!)}
                      >Delete</button> */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
          <div className="flex justify-center my-4 gap-2">
            <button
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-yellow-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">{editDelivery ? 'Edit Delivery' : 'Add Delivery'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-1">Sales Date</label>
                <input
                  className="w-full border px-3 py-2 rounded"
                  name="SalesDate"
                  value={form.SalesDate}
                  onChange={handleChange}
                  type="date"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Customer</label>
                <select
                  className="w-full border px-3 py-2 rounded"
                  name="CustomerID"
                  value={form.CustomerID}
                  onChange={handleChange}
                  required
                  disabled={!!customerId}
                >
                  <option value="">Select Customer</option>
                  {customers.map((c) => (
                    <option key={c.CustomerID} value={c.CustomerID}>{c.CustomerName}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-1">Delivery Details</label>
                <div className="space-y-2">
                  {Array.isArray(form.deliveryDetails) && form.deliveryDetails.map((detail: DeliveryDetailForm, idx: number) => {
                    const product = products.find(p => p.productID === detail.productID);
                    const today = new Date().toISOString().split('T')[0];
                    return (
                      <div key={idx} className="flex gap-2 items-center">
                        <div className="flex flex-col">
                          <select
                            className="border px-2 py-1 rounded"
                            value={detail.productID}
                            onChange={e => handleDetailChange(idx, 'productID', Number(e.target.value))}
                            required
                          >
                            <option value="">Select Product</option>
                            {products.map(p => (
                              <option key={p.productID} value={p.productID}>{p.productName}</option>
                            ))}
                          </select>
                          <span className="text-xs text-gray-500">{product ? `Product: ${product.productName}` : 'Select a product'}</span>
                        </div>
                        <div className="flex flex-col">
                          <input
                            className="border px-2 py-1 rounded w-20"
                            type="number"
                            min={1}
                            value={detail.deliveryQuantity}
                            onChange={e => handleDetailChange(idx, 'deliveryQuantity', Number(e.target.value))}
                            required
                            placeholder="Quantity"
                          />
                          <span className="text-xs text-gray-500">Enter quantity</span>
                        </div>
                        <div className="flex flex-col">
                          <input
                            className="border px-2 py-1 rounded"
                            type="date"
                            min={today}
                            value={detail.expectedDate}
                            onChange={e => handleDetailChange(idx, 'expectedDate', e.target.value)}
                            required
                          />
                          <span className="text-xs text-gray-500">Expected date</span>
                        </div>
                        <button
                          type="button"
                          className="text-red-500 hover:underline px-2"
                          onClick={() => handleRemoveDetail(idx)}
                          title="Remove"
                        >✕</button>
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    className="mt-2 px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                    onClick={handleAddDetail}
                  >
                    + Add Detail
                  </button>
                </div>
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
      {/* Delete Modal */}
      {/* {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4">Delete Delivery</h2>
            <p>Are you sure you want to delete this delivery?</p>
            <div className="flex justify-end mt-6">
              <button
                className="mr-2 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => setShowDeleteModal(false)}
              >Cancel</button>
              <button
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                onClick={confirmDelete}
              >Delete</button>
            </div>
          </div>
        </div>
      )} */}
    </MainLayout>
  );
};

export default DeliveriesPage; 