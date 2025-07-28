import React, { useEffect, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  Customer,
} from '../../services/CustomerService';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Search, Edit, Trash, Eye } from 'lucide-react';
import { UserRole } from '../../common/enums';

interface CustomerWithDeliveries extends Customer {
  hasDeliveries?: boolean;
}

interface User {
  $id: string;
  id: string;
  displayName: string;
  username: string;
  email: string | null;
  isDisabled: boolean;
  userRole: number;
}

const defaultForm: Omit<Customer, 'customerID'> = {
  CustomerName: '',
  CustomerAddress: '',
};

const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerWithDeliveries[]>([]);
  const [allCustomers, setAllCustomers] = useState<CustomerWithDeliveries[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteCustomerId, setDeleteCustomerId] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

  // Check if user has admin role
  const isAdmin = currentUser && currentUser.userRole === UserRole.Admin;

  const checkCustomerDeliveries = async (customerId: number): Promise<boolean> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/odata/Deliveries?$filter=customerID eq ${customerId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      const data = await response.json();
      return data.value && Array.isArray(data.value) && data.value.length > 0;
    } catch (error) {
      return false;
    }
  };

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await getCustomers(20);
      if (data && Array.isArray(data.value)) {
        console.log(data.value);
        
        // Check deliveries for each customer
        const customersWithDeliveries = await Promise.all(
          data.value.map(async (customer: CustomerWithDeliveries) => {
            const hasDeliveries = await checkCustomerDeliveries(customer.CustomerID!);
            return { ...customer, hasDeliveries };
          })
        );
        
        setAllCustomers(customersWithDeliveries);
        setCustomers(customersWithDeliveries);
      } else {
        setCustomers([]);
        setAllCustomers([]);
      }
    } catch (error) {
      setCustomers([]);
      setAllCustomers([]);
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  // Filter customers based on search term
  useEffect(() => {
    let filtered = allCustomers;

    if (searchTerm) {
      filtered = filtered.filter(customer => 
        customer.CustomerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.CustomerAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.CustomerID?.toString().includes(searchTerm)
      );
    }

    setCustomers(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchTerm, allCustomers]);

  useEffect(() => {
    fetchCustomers();
    setCurrentPage(1); // Reset to first page on data reload
  }, []);

  const handleAdd = () => {
    setEditCustomer(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditCustomer(customer);
    setForm({
      CustomerName: customer.CustomerName,
      CustomerAddress: customer.CustomerAddress,
    });
    setShowModal(true);
  };

  const handleDelete = (customerID: number) => {
    setDeleteCustomerId(customerID);
    setShowDeleteModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editCustomer) {
        await updateCustomer(editCustomer.CustomerID!, {
          ...editCustomer,
          ...form,
        });
        toast.success('Customer updated successfully');
      } else {
        await createCustomer(form);
        toast.success('Customer created successfully');
      }
      setShowModal(false);
      fetchCustomers();
    } catch (error) {
      toast.error('Failed to save customer');
    }
  };

  const confirmDelete = async () => {
    if (deleteCustomerId == null) return;
    try {
      await deleteCustomer(deleteCustomerId);
      toast.success('Customer deleted successfully');
      setShowDeleteModal(false);
      fetchCustomers();
    } catch (error) {
      toast.error('Failed to delete customer');
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const totalPages = Math.ceil(customers.length / itemsPerPage);
  const paginatedCustomers = customers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>
        {isAdmin && (
          <button
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
            onClick={handleAdd}
          >
            Add Customer
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by customer name, address, or ID..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading customers...</div>
      ) : (
        <>
          {paginatedCustomers.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-gray-500 text-lg mb-2">
                {searchTerm 
                  ? "No customers found matching your search criteria" 
                  : "No customers found"}
              </div>
              <div className="text-gray-400 text-sm">
                {searchTerm 
                  ? "Try adjusting your search terms" 
                  : isAdmin ? "Get started by adding a new customer" : "No customers available"}
              </div>
            </div>
          ) : (
            <div className="flex justify-center w-full">
              <table className="w-full min-w-full bg-white rounded shadow my-4">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b text-center">ID</th>
                    <th className="py-2 px-4 border-b text-center">Name</th>
                    <th className="py-2 px-4 border-b text-center">Address</th>
                    <th className="py-2 px-4 border-b text-center">Created Date</th>
                    <th className="py-2 px-4 border-b text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCustomers.map((customer) => (
                    <tr key={customer.CustomerID}>
                      <td className="py-2 px-4 border-b text-center">{customer.CustomerID}</td>
                      <td className="py-2 px-4 border-b text-center">{customer.CustomerName}</td>
                      <td className="py-2 px-4 border-b text-center">{customer.CustomerAddress}</td>
                      <td className="py-2 px-4 border-b text-center">{customer.CreatedDate ? new Date(customer.CreatedDate).toLocaleString() : ''}</td>
                      <td className="py-2 px-4 border-b text-left">
                        <div className="flex gap-2">
                          {isAdmin && (
                            <>
                              <button
                                className="text-blue-500 hover:underline flex items-center gap-1"
                                onClick={() => handleEdit(customer)}
                              >
                                <Edit size={16} />
                                Edit
                              </button>
                              <button
                                className="text-red-500 hover:underline flex items-center gap-1"
                                onClick={() => handleDelete(customer.CustomerID!)}
                              >
                                <Trash size={16} />
                                Delete
                              </button>
                            </>
                          )}
                          {customer.hasDeliveries && (
                            <button
                              className="text-green-600 hover:underline flex items-center gap-1"
                              onClick={() => navigate(`/deliveries/${customer.CustomerID}`)}
                            >
                              <Eye size={16} />
                              View Deliveries
                            </button>
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
          {paginatedCustomers.length > 0 && totalPages > 1 && (
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
      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editCustomer ? 'Edit Customer' : 'Add Customer'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-1">Name</label>
                <input
                  className="w-full border px-3 py-2 rounded"
                  name="CustomerName"
                  value={form.CustomerName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Address</label>
                <input
                  className="w-full border px-3 py-2 rounded"
                  name="CustomerAddress"
                  value={form.CustomerAddress}
                  onChange={handleChange}
                  required
                />
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
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4">Delete Customer</h2>
            <p>Are you sure you want to delete this customer?</p>
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
      )}
    </MainLayout>
  );
};

export default CustomersPage; 