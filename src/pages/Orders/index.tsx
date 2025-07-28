import React, { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import {
  getOrders,
  getProducts,
  deleteOrder,
} from "../../services/OrderService";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash, View } from "lucide-react";

interface Provider {
  ProviderID: number;
  ProviderName: string;
}

interface Warehouse {
  WarehouseID: number;
  WarehouseName: string;
}

interface OrderDetail {
  OrderDetailID: number;
  ProductID: number;
  ProductName: string;
  OrderQuantity: number;
  ExpectedDate: string;
}

interface Order {
  OrderID: number;
  OrderDate: string;
  Provider?: Provider;
  Warehouse?: Warehouse;
  OrderDetails?: OrderDetail[];
  TotalAmount?: number;
}

interface ProductPrice {
  ProductPriceId: number;
  CostPrice: number;
  SellingPrice: number;
  IsActive: boolean;
}

interface Product {
  ProductID: number;
  ProductName: string;
  Prices: ProductPrice[];
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  // const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [orderData, productData] = await Promise.all([
        getOrders(),
        getProducts(),
      ]);

      // Compute total amount for each order
      const ordersWithTotal = orderData.map((order: Order) => ({
        ...order,
        TotalAmount: calculateTotalAmount(
          order.OrderDetails || [],
          productData
        ),
      }));

      setOrders(ordersWithTotal);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Không thể tải dữ liệu đơn hàng";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalAmount = (
    orderDetails: OrderDetail[],
    products: Product[]
  ) => {
    return orderDetails.reduce((total, detail) => {
      const product = products.find((p) => p.ProductID === detail.ProductID);
      const activePrice = product?.Prices.find((price) => price.IsActive);
      const costPrice = activePrice?.CostPrice ?? 0;
      return total + costPrice * detail.OrderQuantity;
    }, 0);
  };

  const filteredOrders = orders.filter((order) => {
    const search = searchTerm.toLowerCase();
    return (
      (order.Provider?.ProviderName?.toLowerCase() || "").includes(search) ||
      (order.Warehouse?.WarehouseName?.toLowerCase() || "").includes(search) ||
      order.OrderID.toString().includes(search)
    );
  });

  const handleCreateNewOrderClick = () => {
    navigate("/orders/create");
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (!window.confirm(`Bạn có chắc muốn xóa đơn hàng #${orderId}?`)) return;
    try {
      await deleteOrder(orderId);
      toast.success(`Đã xóa đơn hàng #${orderId}`);
      fetchData();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Xóa đơn hàng thất bại";
      toast.error(errorMessage);
    }
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-full mx-auto">
        <h2 className="text-2xl font-bold mb-4">Quản lý Đơn hàng</h2>
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Tìm kiếm theo nhà cung cấp, kho hoặc ID đơn hàng..."
            className="border rounded px-3 py-2 w-1/2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={handleCreateNewOrderClick}
          >
            Tạo Đơn hàng mới
          </button>
        </div>

        {loading ? (
          <p>Đang tải đơn hàng...</p>
        ) : filteredOrders.length === 0 ? (
          <p>Không có đơn hàng nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="py-3 px-4 text-left">ID Đơn hàng</th>
                  <th className="py-3 px-4 text-left">Ngày đặt hàng</th>
                  <th className="py-3 px-4 text-left">Nhà cung cấp</th>
                  <th className="py-3 px-4 text-left">Kho nhập</th>
                  <th className="py-3 px-4 text-left">Tổng tiền</th>
                  <th className="py-3 px-4 text-left">Hành động</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.OrderID}
                    className="border-b border-gray-200 hover:bg-gray-100"
                  >
                    <td className="py-3 px-4">{order.OrderID}</td>
                    <td className="py-3 px-4">
                      {new Date(order.OrderDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      {order.Provider?.ProviderName || "N/A"}
                    </td>
                    <td className="py-3 px-4">
                      {order.Warehouse?.WarehouseName || "N/A"}
                    </td>
                    <td className="py-3 px-4">
                      {(order.TotalAmount ?? 0).toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </td>
                    <td className="py-3 px-4 flex items-center gap-3">
                      <View
                        size={18}
                        className="text-gray-500 cursor-pointer hover:text-purple-600"
                        onClick={() => navigate(`/orders/${order.OrderID}`)}
                      />
                      <Pencil
                        size={18}
                        className="text-gray-500 cursor-pointer hover:text-green-600"
                        onClick={() =>
                          navigate(`/orders/${order.OrderID}/edit`)
                        }
                      />
                      <Trash
                        size={18}
                        className="text-gray-500 cursor-pointer hover:text-red-600"
                        onClick={() => handleDeleteOrder(order.OrderID)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default OrdersPage;
