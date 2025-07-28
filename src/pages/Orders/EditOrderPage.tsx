import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import {
  getOrders,
  getProviders,
  getWarehouses,
  getProducts,
  updateOrder,
} from "../../services/OrderService";
import { toast } from "react-hot-toast";

interface OrderDetail {
  productID: number;
  orderQuantity: number;
  expectedDate: string;
}

interface Product {
  ProductID: number;
  ProductName: string;
}

const EditOrderPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [providers, setProviders] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [orderDate, setOrderDate] = useState("");
  const [providerID, setProviderID] = useState<number>(0);
  const [warehouseID, setWarehouseID] = useState<number>(0);
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch order details and other data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [orderList, prov, ware, prod] = await Promise.all([
          getOrders(),
          getProviders(),
          getWarehouses(),
          getProducts(),
        ]);

        setProviders(prov);
        setWarehouses(ware);
        setProducts(prod);

        const order = orderList.find((o: any) => o.OrderID === Number(orderId));
        if (!order) {
          toast.error("Không tìm thấy đơn hàng");
          navigate("/orders");
          return;
        }

        setOrderDate(order.OrderDate.split("T")[0]);
        setProviderID(order.Provider?.ProviderID || 0);
        setWarehouseID(order.Warehouse?.WarehouseID || 0);
        setOrderDetails(
          order.OrderDetails?.map((d: any) => ({
            productID: d.ProductID,
            orderQuantity: d.OrderQuantity,
            expectedDate: d.ExpectedDate?.split("T")[0] || "",
          })) || []
        );
      } catch (err: any) {
        toast.error(err?.message || "Không thể tải dữ liệu đơn hàng");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [orderId, navigate]);

  const handleDetailChange = (
    idx: number,
    field: keyof OrderDetail,
    value: any
  ) => {
    setOrderDetails((details) =>
      details.map((d, i) => (i === idx ? { ...d, [field]: value } : d))
    );
  };

  const handleAddDetail = () => {
    setOrderDetails((details) => [
      ...details,
      {
        productID: products[0]?.ProductID || 0,
        orderQuantity: 1,
        expectedDate: "",
      },
    ]);
  };

  const handleRemoveDetail = (idx: number) => {
    setOrderDetails((details) => details.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateOrder(Number(orderId), {
        OrderID: Number(orderId), // Add this line to match the URL key
        OrderDate: orderDate,
        ProviderID: providerID,
        WarehouseId: warehouseID,
        OrderDetails: orderDetails.map((d) => ({
          ProductID: d.productID,
          OrderQuantity: d.orderQuantity,
          ExpectedDate: d.expectedDate,
        })),
      });
      toast.success("Cập nhật đơn hàng thành công!");
      navigate("/orders");
    } catch (err: any) {
      toast.error(err?.message || "Cập nhật đơn hàng thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">
          Chỉnh sửa Đơn hàng #{orderId}
        </h2>
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Ngày đặt hàng</label>
              <input
                type="date"
                className="border rounded px-2 py-1 w-full"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Nhà cung cấp</label>
              <select
                className="border rounded px-2 py-1 w-full"
                value={providerID}
                onChange={(e) => setProviderID(Number(e.target.value))}
                required
              >
                {providers.map((p) => (
                  <option key={p.ProviderID} value={p.ProviderID}>
                    {p.ProviderName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium">Kho nhập</label>
              <select
                className="border rounded px-2 py-1 w-full"
                value={warehouseID}
                onChange={(e) => setWarehouseID(Number(e.target.value))}
                required
              >
                {warehouses.map((w) => (
                  <option key={w.WarehouseID} value={w.WarehouseID}>
                    {w.WarehouseName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium">
                Chi tiết đơn hàng
              </label>
              {orderDetails.map((detail, idx) => (
                <div key={idx} className="flex gap-2 mb-2 items-center">
                  <select
                    className="border rounded px-2 py-1"
                    value={detail.productID}
                    onChange={(e) =>
                      handleDetailChange(
                        idx,
                        "productID",
                        Number(e.target.value)
                      )
                    }
                    required
                  >
                    {products.map((p) => (
                      <option key={p.ProductID} value={p.ProductID}>
                        {p.ProductName}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    className="border rounded px-2 py-1 w-20"
                    value={detail.orderQuantity}
                    onChange={(e) =>
                      handleDetailChange(
                        idx,
                        "orderQuantity",
                        Number(e.target.value)
                      )
                    }
                    required
                  />
                  <input
                    type="date"
                    className="border rounded px-2 py-1"
                    value={detail.expectedDate}
                    onChange={(e) =>
                      handleDetailChange(idx, "expectedDate", e.target.value)
                    }
                    required
                  />
                  <button
                    type="button"
                    className="text-red-500"
                    onClick={() => handleRemoveDetail(idx)}
                    disabled={orderDetails.length === 1}
                  >
                    X
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="text-blue-500"
                onClick={handleAddDetail}
              >
                + Thêm sản phẩm
              </button>
            </div>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded"
              disabled={loading}
            >
              {loading ? "Đang lưu..." : "Lưu Thay đổi"}
            </button>
          </form>
        )}
      </div>
    </MainLayout>
  );
};

export default EditOrderPage;
