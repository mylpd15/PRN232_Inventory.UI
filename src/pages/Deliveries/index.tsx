import React, { useEffect, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getDeliveriesByCustomer,
  Delivery,
} from '../../services/DeliveryService';
import { toast } from 'react-hot-toast';

const DeliveriesPage: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(deliveries.length / itemsPerPage);
  const paginatedDeliveries = deliveries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
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
  }, [customerId]);

  const handleAdd = () => {
    navigate('/deliveries/add', { state: { customerId } });
  };

  const handleEdit = (delivery: Delivery) => {
    navigate(`/deliveries/edit/${delivery.DeliveryID}`, { state: { customerId } });
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
                    <td className="py-2 px-4 border-b text-center">
                      {delivery.SalesDate ? new Date(delivery.SalesDate).toLocaleString() : ''}
                    </td>
                    <td className="py-2 px-4 border-b text-center">{delivery.Status}</td>
                    <td className="py-2 px-4 border-b text-center">
                      {delivery.CreatedDate ? new Date(delivery.CreatedDate).toLocaleString() : ''}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {delivery.UpdatedDate ? new Date(delivery.UpdatedDate).toLocaleString() : ''}
                    </td>
                    <td className="py-2 px-4 border-b flex gap-2 justify-center text-center">
                      <button
                        className="text-blue-500 hover:underline mr-2"
                        onClick={() => handleEdit(delivery)}
                      >
                        Edit
                      </button>
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
    </MainLayout>
  );
};

export default DeliveriesPage; 