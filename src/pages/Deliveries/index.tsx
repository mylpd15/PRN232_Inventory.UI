import React, { useEffect, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getDeliveriesByCustomer,
  updateDelivery,
  Delivery,
} from '../../services/DeliveryService';
import { toast } from 'react-hot-toast';
import { Check, X, Edit, Search } from 'lucide-react';
import { UserRole } from '../../common/enums';

interface User {
  $id: string;
  id: string;
  displayName: string;
  username: string;
  email: string | null;
  isDisabled: boolean;
  userRole: number;
}

interface Customer {
  CustomerID: number;
  CustomerName: string;
  CustomerAddress: string;
}

interface DeliveryWithCustomer extends Delivery {
  customerName?: string;
}

const DeliveriesPage: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState<DeliveryWithCustomer[]>([]);
  const [allDeliveries, setAllDeliveries] = useState<DeliveryWithCustomer[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const itemsPerPage = 10;

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

  // Fetch customers for customer name lookup
  const fetchCustomers = async () => {
    try {
      const res = await fetch('https://localhost:7136/odata/Customers', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      const data = await res.json();
      const customersArray = Array.isArray(data.value) ? data.value : [];
      setCustomers(customersArray);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      setCustomers([]);
    }
  };

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
      
      const deliveriesArray = Array.isArray(data.value) ? data.value : [];
      
      // Add customer names to deliveries
      const deliveriesWithCustomerNames = deliveriesArray.map((delivery: DeliveryWithCustomer) => {
        const customer = customers.find(c => c.CustomerID === delivery.CustomerID);
        return {
          ...delivery,
          customerName: customer?.CustomerName || `Customer ${delivery.CustomerID}`
        };
      });
      
      setAllDeliveries(deliveriesWithCustomerNames);
      setDeliveries(deliveriesWithCustomerNames);
    } catch (error) {
      setDeliveries([]);
      setAllDeliveries([]);
      toast.error('Failed to fetch deliveries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (customers.length > 0) {
      fetchDeliveries();
      setCurrentPage(1); // Reset to first page on data reload
    }
  }, [customerId, customers]);

  // Filter deliveries based on search term and selected statuses
  useEffect(() => {
    let filtered = allDeliveries;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(delivery => 
        delivery.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.DeliveryID?.toString().includes(searchTerm) ||
        delivery.SalesDate?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by selected statuses
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter(delivery => {
        const statusText = getStatusText(delivery.Status);
        return selectedStatuses.includes(statusText);
      });
    }

    setDeliveries(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchTerm, selectedStatuses, allDeliveries]);

  const totalPages = Math.ceil(deliveries.length / itemsPerPage);
  const paginatedDeliveries = deliveries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleAdd = () => {
    navigate('/deliveries/add', { state: { customerId } });
  };

  const handleEdit = (delivery: Delivery) => {
    navigate(`/deliveries/edit/${delivery.DeliveryID}`, { state: { customerId } });
  };

  const handleApprove = async (delivery: Delivery) => {
    try {
      await updateDelivery(delivery.DeliveryID!, {
        SalesDate: delivery.SalesDate,
        CustomerID: delivery.CustomerID,
        Status: 4, // Requested
      });
      toast.success('Delivery approved successfully');
      fetchDeliveries(); // Refresh the list
    } catch (error) {
      toast.error('Failed to approve delivery');
    }
  };

  const handleUnapprove = async (delivery: Delivery) => {
    try {
      await updateDelivery(delivery.DeliveryID!, {
        SalesDate: delivery.SalesDate,
        CustomerID: delivery.CustomerID,
        Status: 3, // Cancelled
      });
      toast.success('Delivery unapproved successfully');
      fetchDeliveries(); // Refresh the list
    } catch (error) {
      toast.error('Failed to unapprove delivery');
    }
  };

  // Check if user has admin or warehouse manager role
  const canApprove = currentUser && (currentUser.userRole === UserRole.Admin || currentUser.userRole === UserRole.WarehouseManager);

  // Get status display text
  const getStatusText = (status: string | number | undefined) => {
    if (status === undefined) return 'Unknown';
    
    switch (status) {
      case 0:
      case '0':
      case 'Pending':
        return 'Pending';
      case 1:
      case '1':
      case 'Shipped':
        return 'Shipped';
      case 2:
      case '2':
      case 'Delivered':
        return 'Delivered';
      case 3:
      case '3':
      case 'Cancelled':
        return 'Cancelled';
      case 4:
      case '4':
      case 'Accepted':
        return 'Accepted';
      default:
        return String(status);
    }
  };

  // Get status badge color
  const getStatusBadge = (status: string | number | undefined) => {
    const statusText = getStatusText(status);
    switch (statusText) {
      case 'Pending':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">Pending</span>;
      case 'Shipped':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">Shipped</span>;
      case 'Delivered':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Delivered</span>;
      case 'Cancelled':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Cancelled</span>;
      case 'Accepted':
        return <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">Accepted</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">{statusText}</span>;
    }
  };

  // Handle status filter change
  const handleStatusFilterChange = (status: string) => {
    setSelectedStatuses(prev => {
      if (prev.includes(status)) {
        return prev.filter(s => s !== status);
      } else {
        return [...prev, status];
      }
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatuses([]);
  };

  const statusOptions = ['Pending', 'Shipped', 'Delivered', 'Cancelled', 'Accepted'];

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

      {/* Search and Filter Section */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by customer name, delivery ID, or date..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusFilterChange(status)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedStatuses.includes(status)
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-10">Loading deliveries...</div>
      ) : (
        <>
          {paginatedDeliveries.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-gray-500 text-lg mb-2">
                {searchTerm || selectedStatuses.length > 0 
                  ? "No deliveries found matching your search criteria" 
                  : "No deliveries found"}
              </div>
              <div className="text-gray-400 text-sm">
                {searchTerm || selectedStatuses.length > 0 
                  ? "Try adjusting your search terms or filters" 
                  : "Get started by adding a new delivery"}
              </div>
            </div>
          ) : (
            <div className="flex justify-center w-full">
              <table className="w-full min-w-full bg-white rounded shadow my-4">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b text-center">DeliveryID</th>
                    <th className="py-2 px-4 border-b text-center">SalesDate</th>
                    <th className="py-2 px-4 border-b text-center">Customer Name</th>
                    <th className="py-2 px-4 border-b text-center">Status</th>
                    <th className="py-2 px-4 border-b text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedDeliveries.map((delivery) => (
                    <tr key={delivery.DeliveryID}>
                      <td className="py-2 px-4 border-b text-center">{delivery.DeliveryID}</td>
                      <td className="py-2 px-4 border-b text-center">
                        {delivery.SalesDate ? new Date(delivery.SalesDate).toLocaleDateString() : ''}
                      </td>
                      <td className="py-2 px-4 border-b text-center">
                        {delivery.customerName || `Customer ${delivery.CustomerID}`}
                      </td>
                      <td className="py-2 px-4 border-b text-center">
                        {getStatusBadge(delivery.Status)}
                      </td>
                      <td className="py-2 px-4 border-b text-left">
                        <div className="flex gap-2">
                          <button
                            className="text-blue-500 hover:underline flex items-center gap-1"
                            onClick={() => handleEdit(delivery)}
                          >
                            <Edit size={16} />
                            Edit
                          </button>
                          
                          {/* Show Approve/Unapprove buttons only for Admin/WarehouseManager when status is Pending */}
                          {canApprove && (delivery.Status === 0 || delivery.Status === '0' || delivery.Status === 'Pending') && (
                            <>
                              <button
                                className="text-green-500 hover:text-green-700 flex items-center gap-1"
                                onClick={() => handleApprove(delivery)}
                                title="Approve"
                              >
                                <Check size={16} />
                                Approve
                              </button>
                              <button
                                className="text-red-500 hover:text-red-700 flex items-center gap-1"
                                onClick={() => handleUnapprove(delivery)}
                                title="Unapprove"
                              >
                                <X size={16} />
                                Unapprove
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination Controls - only show when there are results */}
          {paginatedDeliveries.length > 0 && totalPages > 1 && (
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
          )}
        </>
      )}
    </MainLayout>
  );
};

export default DeliveriesPage; 