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

interface Product {
  ProductID: number;
  ProductName: string;
}

interface CustomerOption {
  CustomerID: number;
  CustomerName: string;
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

  useEffect(() => {
    // Fetch products for dropdown
    fetch("https://localhost:7136/odata/Products", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const productsArray = data.value || (Array.isArray(data) ? data : []);
        setProducts(productsArray);
      })
      .catch(() => setProducts([]));

    // Fetch customers for dropdown
   
    fetch("https://localhost:7136/odata/Customers", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        // Handle OData response format with value property
        setCustomers(Array.isArray(data.value) ? data.value : []);
      })
      .catch(() => setCustomers([]));

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
      console.log(fullDelivery);
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
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save delivery";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
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
                    {c.CustomerName}
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
                className="w-full border px-3 py-2 rounded max-w-xs"
                name="Status"
                value={form.Status}
                onChange={handleChange}
              >
                <option value="">Select Status</option>
                <option value="0">Pending</option>
                <option value="1">Shipped</option>
                <option value="2">Delivered</option>
                <option value="3">Cancelled</option>
                <option value="4">Requested</option>
              </select>
            </div>
          )}

          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <label className="block font-medium">Delivery Details</label>
              {isEditMode && form.Status !== 0 && (
                <div className="text-sm text-gray-600">
                  {form.Status === 3 ? "Cannot edit cancelled delivery" : "Can only edit when status is Pending"}
                </div>
              )}
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
                         <div className="grid grid-cols-4 gap-4 items-end">
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
                                 <option key={p.ProductID} value={p.ProductID}>
                                   {p.ProductName}
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
                         </div>
                       </div>
                    );
                  })}
            </div>
          </div>

          <div className="flex justify-end gap-4">
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
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : isEditMode
                ? "Update Delivery"
                : "Create Delivery"}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default DeliveryFormPage;
