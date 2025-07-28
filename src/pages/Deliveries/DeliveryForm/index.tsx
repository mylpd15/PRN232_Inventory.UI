import React, { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  getDeliveryById,
  createDelivery,
  updateDelivery,
  createDeliveryDetail,
  updateDeliveryDetail,
  deleteDeliveryDetail,
  DeliveryDetail,
  CreateDeliveryPayload,
} from "../../../services/DeliveryService";
import { toast } from "react-hot-toast";
import { UserRole } from "../../../common/enums";

interface Product {
  productID: number;
  productName: string;
  prices?: {
    $values?: Array<{
      sellingPrice: number;
      isActive: boolean;
    }>;
  };
}

interface CustomerOption {
  CustomerID: number;
  CustomerName: string;
  CustomerAddress: string;
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

interface DeliveryDetailForm {
  deliveryDetailID?: number;
  productID: number;
  deliveryQuantity: number;
  expectedDate: string;
  isNew?: boolean;
  isDeleted?: boolean;
  isModified?: boolean; 
}

interface DeliveryForm {
  SalesDate: string;
  CustomerID: number;
  Status?: string | number;
  deliveryDetails: DeliveryDetailForm[];
}

const DeliveryFormPage: React.FC = () => {
  const { deliveryId } = useParams<{ deliveryId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const customerId = location.state?.customerId;

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<DeliveryForm>({
    SalesDate: "",
    CustomerID: customerId ? Number(customerId) : 0,
    Status: 0,
    deliveryDetails: [],
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
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

  // Check if user has admin or warehouse manager role
  const canEditStatus = currentUser && (currentUser.userRole === UserRole.Admin || currentUser.userRole === UserRole.WarehouseManager);

  // Check if status field should be disabled
  const isStatusDisabled = isEditMode && form.Status === 0 && !canEditStatus;

  useEffect(() => {
    // Fetch products for dropdown
    fetch(`${import.meta.env.VITE_SERVER_URL}/api/Products`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch products: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        let productsArray = [];
        if (data && data.$values && Array.isArray(data.$values)) {
          productsArray = data.$values;
        } else if (data && data.value && Array.isArray(data.value)) {
          productsArray = data.value;
        } else if (Array.isArray(data)) {
          productsArray = data;
        } else {
          productsArray = [];
        }
        setProducts(productsArray);
      })
      .catch((error) => {
        console.error('Error fetching products from API endpoint:', error);
        
        // Fallback to OData endpoint
        fetch(`${import.meta.env.VITE_SERVER_URL}/odata/Products`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        })
          .then((res) => {
            if (!res.ok) {
              throw new Error(`Failed to fetch products from OData: ${res.status}`);
            }
            return res.json();
          })
          .then((data) => {
            const productsArray = data.value || (Array.isArray(data) ? data : []);
            setProducts(productsArray);
          })
          .catch((fallbackError) => {
            console.error('Error fetching products from OData endpoint:', fallbackError);
            setProducts([]);
            toast.error('Failed to fetch products from both endpoints. Please try again.');
          });
      });

    // Fetch customers for dropdown
   
    fetch(`${import.meta.env.VITE_SERVER_URL}/odata/Customers`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch customers: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        // Handle OData response format with value property
        setCustomers(Array.isArray(data.value) ? data.value : []);
      })
      .catch((error) => {
        console.error('Error fetching customers:', error);
        setCustomers([]);
        toast.error('Failed to fetch customers. Please try again.');
      });

    // If deliveryId exists, fetch delivery data for editing
    if (deliveryId) {
      setIsEditMode(true);
      fetchDeliveryData();
    }
  }, [deliveryId]);

  const fetchDeliveryData = async () => {
    if (!deliveryId) return;

    setLoading(true);
    try {
      const fullDelivery = await getDeliveryById(deliveryId);
      // Handle OData format for delivery details
      const deliveryDetailsArray =
        fullDelivery.deliveryDetails?.$values ||
        (Array.isArray(fullDelivery.deliveryDetails)
          ? fullDelivery.deliveryDetails
          : []);

      // Format the delivery details for the form
             const formattedDetails = deliveryDetailsArray.map(
         (d: DeliveryDetail) => ({
           deliveryDetailID: d.deliveryDetailID,
           productID: d.productID,
           deliveryQuantity: d.deliveryQuantity,
           expectedDate: d.expectedDate
             ? d.expectedDate.split("T")[0]
             : "",
           isNew: false,
           isDeleted: false,
           isModified: false,
         })
       );
      setForm({
                 SalesDate:
           fullDelivery.salesDate || fullDelivery.SalesDate
             ? (fullDelivery.salesDate || fullDelivery.SalesDate).split("T")[0]
             : "",
        CustomerID: fullDelivery.customerID || fullDelivery.CustomerID,
        Status: fullDelivery.status || fullDelivery.Status || 0,
        deliveryDetails: formattedDetails,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch delivery details";
      toast.error(errorMessage);
      navigate("/deliveries");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "Status" ? Number(value) : value,
    });
  };

     const handleDetailChange = (
     idx: number,
     field: keyof DeliveryDetailForm,
     value: unknown
   ) => {
     const details: DeliveryDetailForm[] = Array.isArray(form.deliveryDetails)
       ? [...form.deliveryDetails]
       : [];
     details[idx] = { 
       ...details[idx], 
       [field]: value,
       isModified: !details[idx].isNew 
     };
     setForm({ ...form, deliveryDetails: details });
   };

  const handleAddDetail = () => {
    setForm((prev) => ({
      ...prev,
      deliveryDetails: [
        ...(Array.isArray(prev.deliveryDetails) ? prev.deliveryDetails : []),
                 {
           productID: 0,
           deliveryQuantity: 1,
           expectedDate: "",
           isNew: true,
           isDeleted: false,
           isModified: false,
         },
      ],
    }));
  };

  const handleRemoveDetail = (idx: number) => {
    setForm((prev) => {
      const details: DeliveryDetailForm[] = Array.isArray(prev.deliveryDetails)
        ? [...prev.deliveryDetails]
        : [];
      if (details[idx].isNew) {
        // If it's a new detail, just remove it from the array
        details.splice(idx, 1);
      } else {
        // If it's an existing detail, mark it as deleted
        details[idx] = { ...details[idx], isDeleted: true };
      }
      return { ...prev, deliveryDetails: details };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditMode && deliveryId) {
        // 1. Update the delivery basic info
        await updateDelivery(deliveryId, {
          SalesDate: form.SalesDate,
          CustomerID: form.CustomerID,
          Status: form.Status,
        });

        // 2. Handle delivery details changes - only if status allows editing
        if (form.Status !== 3) { // Not cancelled
          const currentDetails = form.deliveryDetails.filter((d) => !d.isDeleted);

          for (const detail of currentDetails) {
            if (detail.isNew && form.Status === 0) {
              // 3. Create new delivery detail - only when status is Pending (0)
              await createDeliveryDetail({
                deliveryID: Number(deliveryId),
                productID: detail.productID,
                deliveryQuantity: detail.deliveryQuantity,
                expectedDate: detail.expectedDate,
              });
            } else if (detail.deliveryDetailID && detail.isModified && form.Status === 0) {
              // 4. Update existing delivery detail - only when modified and status is Pending (0)
              await updateDeliveryDetail(detail.deliveryDetailID, {
                productID: detail.productID,
                deliveryQuantity: detail.deliveryQuantity,
                expectedDate: detail.expectedDate,
                deliveryID: Number(deliveryId),
              });
            }
          }

          // 5. Delete removed delivery details - only when status is Pending (0)
          if (form.Status === 0) {
            const deletedDetails = form.deliveryDetails.filter(
              (d) => d.isDeleted && d.deliveryDetailID
            );
            for (const detail of deletedDetails) {
              if (detail.deliveryDetailID) {
                await deleteDeliveryDetail(detail.deliveryDetailID);
              }
            }
          }
        }

        toast.success("Delivery updated successfully");
      } else {
        // For creating new delivery
        const submitForm: CreateDeliveryPayload = {
          SalesDate: form.SalesDate,
          CustomerID: form.CustomerID,
          deliveryDetails: form.deliveryDetails.map(
            (d: DeliveryDetailForm) => ({
              productID: Number(d.productID),
              deliveryQuantity: Number(d.deliveryQuantity),
              expectedDate: d.expectedDate || "",
            })
          ),
        };
        await createDelivery(submitForm);
        toast.success("Delivery created successfully");
      }

      // Navigate back to previous page
      navigate(-1);
    } catch (error: unknown) {
      let errorMessage = "Failed to save delivery";
      
      if (error instanceof Error) {
        // Try to parse error message for better user experience
        try {
          const errorData = JSON.parse(error.message);
          if (errorData.message) {
            errorMessage = errorData.message;
          } else {
            errorMessage = error.message;
          }
        } catch {
          // If not JSON, use the error message as is
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Check if any delivery detail has past expected date
  const hasPastExpectedDates = () => {
    if (form.Status !== 0) return false; // Only check for pending status
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    
    return form.deliveryDetails.some(detail => {
      if (!detail.expectedDate || detail.isDeleted) return false;
      const expectedDate = new Date(detail.expectedDate);
      return expectedDate < today;
    });
  };

  // Get past expected date details for display
  const getPastExpectedDateDetails = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return form.deliveryDetails
      .filter(detail => {
        if (!detail.expectedDate || detail.isDeleted) return false;
        const expectedDate = new Date(detail.expectedDate);
        return expectedDate < today;
      })
      .map(detail => {
        const product = products.find(p => p.productID === detail.productID);
        return {
          productName: product?.productName || `Product ${detail.productID}`,
          expectedDate: detail.expectedDate
        };
      });
  };

  // Calculate total delivery value
  const calculateTotal = () => {
    let total = 0;
  
    
    form.deliveryDetails
      .filter(detail => !detail.isDeleted)
      .forEach(detail => {
        const product = products.find(p => p.productID === detail.productID);
        if (product && product.prices && product.prices.$values && product.prices.$values.length > 0) {
          // Get the first active price or the first price if no active ones
          const activePrice = product.prices.$values.find(price => price.isActive) || product.prices.$values[0];
          if (activePrice) {
            total += activePrice.sellingPrice * detail.deliveryQuantity;
          } else {
            total += 20 * detail.deliveryQuantity; // Default price
          }
        } else {
          total += 20 * detail.deliveryQuantity; // Default price for products without prices
        }
      });
    
    return total;
  };

  // Get product price for display
  const getProductPrice = (productID: number) => {
    // Don't calculate if products haven't loaded yet
    if (products.length === 0) {
      return 20; // Default price
    }
    
    const product = products.find(p => p.productID === productID);
    if (product && product.prices && product.prices.$values && product.prices.$values.length > 0) {
      const activePrice = product.prices.$values.find(price => price.isActive) || product.prices.$values[0];
      return activePrice ? activePrice.sellingPrice : 20; // Default to 20 if no valid price
    }
    return 20; // Default price for products without prices
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (loading && isEditMode) {
    return (
      <MainLayout>
        <div className="text-center py-10">Loading delivery details...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {isEditMode ? "Edit Delivery" : "Add New Delivery"}
          </h1>
          <button
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block mb-2 font-medium">Sales Date</label>
              <input
                className="w-full border px-3 py-2 rounded"
                name="SalesDate"
                value={form.SalesDate}
                onChange={handleChange}
                type="date"
                max={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">Customer</label>
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
                  <option key={c.CustomerID} value={c.CustomerID}>
                    {c.CustomerName} - {c.CustomerAddress}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status field - only show in edit mode */}
          {isEditMode && (
            <div className="mb-6">
              <label className="block mb-2 font-medium">Status</label>
              <select
                className={`w-full border px-3 py-2 rounded max-w-xs ${
                  isStatusDisabled ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                name="Status"
                value={form.Status}
                onChange={handleChange}
                disabled={isStatusDisabled}
              >
                <option value="">Select Status</option>
                <option value="0">Pending</option>
                <option value="1">Shipped</option>
                <option value="2">Delivered</option>
                <option value="3">Cancelled</option>
                <option value="4">Accepted</option>
              </select>
              {isStatusDisabled && (
                <p className="text-sm text-gray-600 mt-1">
                  Only Admin and Warehouse Manager can change status when delivery is pending
                </p>
              )}
            </div>
          )}

          {/* Past Expected Date Warning */}
          {hasPastExpectedDates() && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Past Expected Dates Detected
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>The following delivery items have expected dates in the past:</p>
                    <ul className="mt-1 list-disc list-inside">
                      {getPastExpectedDateDetails().map((item, index) => (
                        <li key={index}>
                          <strong>{item.productName}</strong> - Expected: {new Date(item.expectedDate).toLocaleDateString()}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 font-medium">
                      Please update these delivery items to future dates to ensure proper delivery scheduling.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <label className="block font-medium">Delivery Details</label>
              <div className="flex items-center gap-4">
                {form.deliveryDetails.filter(d => !d.isDeleted).length > 0 && (
                  <div className="text-sm font-medium text-gray-700">
                    Total: ${calculateTotal().toFixed(2)}
                  </div>
                )}
                {isEditMode && form.Status !== 0 && (
                  <div className="text-sm text-gray-600">
                    {form.Status === 3 ? "Cannot edit cancelled delivery" : "Can only edit when status is Pending"}
                  </div>
                )}
                {/* Only show Add Detail button for Admin or WarehouseManager, or if not in edit mode */}
                {(canEditStatus || !isEditMode) && (
                  <button
                    type="button"
                    className={`px-3 py-1 rounded text-white ${
                      isEditMode && form.Status !== 0 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-yellow-500 hover:bg-yellow-600'
                    }`}
                    onClick={handleAddDetail}
                    disabled={isEditMode && form.Status !== 0}
                  >
                    + Add Detail
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {Array.isArray(form.deliveryDetails) &&
                form.deliveryDetails
                  .filter((detail) => !detail.isDeleted)
                  .map((detail: DeliveryDetailForm, idx: number) => {
                    const today = new Date().toISOString().split("T")[0];
                    return (
                                             <div
                         key={idx}
                         className={`border rounded p-4 ${
                           detail.isNew ? "bg-green-50" : "bg-gray-50"
                         }`}
                       >
                         <div className="grid grid-cols-5 gap-4 items-end">
                           <div>
                             <label className="block mb-1 text-sm font-medium">
                               Product
                             </label>
                             <select
                               className={`w-full border px-3 py-2 rounded ${
                                 isEditMode && form.Status !== 0 ? 'bg-gray-100' : ''
                               }`}
                               value={detail.productID}
                               onChange={(e) =>
                                 handleDetailChange(
                                   idx,
                                   "productID",
                                   Number(e.target.value)
                                 )
                               }
                               required
                               disabled={isEditMode && form.Status !== 0}
                             >
                               <option value="">Select Product</option>
                               {products.map((p) => (
                                 <option key={p.productID} value={p.productID}>
                                   {p.productName}
                                 </option>
                               ))}
                             </select>
                           </div>
                           <div>
                             <label className="block mb-1 text-sm font-medium">
                               Quantity
                             </label>
                             <input
                               className={`w-full border px-3 py-2 rounded ${
                                 isEditMode && form.Status !== 0 ? 'bg-gray-100' : ''
                               }`}
                               type="number"
                               min={1}
                               value={detail.deliveryQuantity}
                               onChange={(e) =>
                                 handleDetailChange(
                                   idx,
                                   "deliveryQuantity",
                                   Number(e.target.value)
                                 )
                               }
                               required
                               placeholder="Enter quantity"
                               disabled={isEditMode && form.Status !== 0}
                             />
                           </div>
                           <div>
                             <label className="block mb-1 text-sm font-medium">
                               Price
                             </label>
                             <div className="w-full border px-3 py-2 rounded bg-gray-50 text-sm">
                               ${getProductPrice(detail.productID).toFixed(2)}
                             </div>
                           </div>
                           <div>
                             <label className="block mb-1 text-sm font-medium">
                               Expected Date
                             </label>
                             <input
                               className={`w-full border px-3 py-2 rounded ${
                                 isEditMode && form.Status !== 0 ? 'bg-gray-100' : ''
                               }`}
                               type="date"
                               min={today}
                               value={detail.expectedDate}
                               onChange={(e) =>
                                 handleDetailChange(
                                   idx,
                                   "expectedDate",
                                   e.target.value
                                 )
                               }
                               required
                               disabled={isEditMode && form.Status !== 0}
                             />
                           </div>
                           {/* Only show remove button for Admin or WarehouseManager, or if not in edit mode */}
                           {(canEditStatus || !isEditMode) && (
                             <div className="flex items-end">
                               <button
                                 type="button"
                                 className={`px-3 py-2 border rounded ${
                                   isEditMode && form.Status !== 0 
                                     ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                                     : 'text-red-500 hover:text-red-700 hover:bg-red-50'
                                 }`}
                                 onClick={() => handleRemoveDetail(idx)}
                                 title="Remove"
                                 disabled={isEditMode && form.Status !== 0}
                               >
                                 ✕
                               </button>
                             </div>
                           )}
                         </div>
                         {detail.productID > 0 && detail.deliveryQuantity > 0 && (
                           <div className="mt-2 text-sm text-gray-600">
                             Subtotal: ${(getProductPrice(detail.productID) * detail.deliveryQuantity).toFixed(2)}
                           </div>
                         )}
                       </div>
                    );
                  })}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            {/* Only show buttons for Admin or WarehouseManager, or if not in edit mode */}
            {(canEditStatus || !isEditMode) && (
              <>
                <button
                  type="button"
                  className="px-6 py-2 rounded bg-gray-200 hover:bg-gray-300"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded bg-yellow-500 text-white hover:bg-yellow-600 disabled:opacity-50"
                  disabled={loading || (isEditMode && form.Status !== 0)}
                >
                  {loading
                    ? "Saving..."
                    : isEditMode
                    ? "Update Delivery"
                    : "Create Delivery"}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default DeliveryFormPage;
