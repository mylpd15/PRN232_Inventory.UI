import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getOrderById, getProducts } from "../../services/OrderService";
import { toast } from "react-hot-toast";

interface Provider {
  ProviderName: string;
}

interface Warehouse {
  WarehouseName: string;
}

interface OrderDetail {
  OrderDetailID: number;
  ProductID: number;
  OrderQuantity: number;
  ExpectedDate: string;
  ActualDate?: string;
}

interface Order {
  OrderID: number;
  OrderDate: string;
  Provider?: Provider;
  Warehouse?: Warehouse;
  OrderDetails: OrderDetail[];
  Status: string;
  RejectReason?: string;
}

interface ProductPrice {
  CostPrice: number;
  IsActive: boolean;
}

interface Product {
  ProductID: number;
  ProductName: string;
  Prices: ProductPrice[];
}

const OrderDetailsPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrderAndProducts();
  }, [orderId]);

  const fetchOrderAndProducts = async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const [orderData, productData] = await Promise.all([
        getOrderById(Number(orderId)),
        getProducts(),
      ]);
      setOrder(orderData);
      setProducts(productData);
    } catch (err: any) {
      toast.error(err?.message || "Không thể tải thông tin đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (productID: number) => {
    return (
      products.find((p) => p.ProductID === productID)?.ProductName ||
      `#${productID}`
    );
  };

  const getProductPrice = (productID: number) => {
    const product = products.find((p) => p.ProductID === productID);
    const activePrice = product?.Prices.find((price) => price.IsActive);
    return activePrice?.CostPrice || 0;
  };

  const calculateTotalAmount = () => {
    if (!order) return 0;
    return order.OrderDetails.reduce((total, detail) => {
      return total + detail.OrderQuantity * getProductPrice(detail.ProductID);
    }, 0);
  };

  if (loading) {
    return (
      <MainLayout>
        <p className="p-6">Đang tải thông tin đơn hàng...</p>
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout>
        <p className="p-6">Không tìm thấy đơn hàng.</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">
          Chi tiết Đơn hàng #{order.OrderID}
        </h2>
        <div className="mb-4">
          <p>
            <strong>Ngày đặt hàng:</strong>{" "}
            {new Date(order.OrderDate).toLocaleDateString()}
          </p>
          <p>
            <strong>Nhà cung cấp:</strong>{" "}
            {order.Provider?.ProviderName || "N/A"}
          </p>
          <p>
            <strong>Kho nhập:</strong> {order.Warehouse?.WarehouseName || "N/A"}
          </p>
          <p>
            <strong>Trạng thái:</strong> {order.Status}
          </p>
          {order.RejectReason && (
            <p>
              <strong>Lý do từ chối:</strong> {order.RejectReason}
            </p>
          )}
        </div>

        <h3 className="text-xl font-semibold mb-2">Chi tiết sản phẩm</h3>
        {order.OrderDetails.length === 0 ? (
          <p>Không có sản phẩm nào.</p>
        ) : (
          <table className="min-w-full bg-white shadow rounded-lg mb-4">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="py-2 px-3 text-left">Sản phẩm</th>
                <th className="py-2 px-3 text-left">Giá</th>
                <th className="py-2 px-3 text-left">Số lượng</th>
                <th className="py-2 px-3 text-left">Ngày dự kiến</th>
                <th className="py-2 px-3 text-left">Ngày thực tế</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {order.OrderDetails.map((detail) => (
                <tr
                  key={detail.OrderDetailID}
                  className="border-b border-gray-200"
                >
                  <td className="py-2 px-3">
                    {getProductName(detail.ProductID)}
                  </td>
                  <td className="py-2 px-3">
                    {getProductPrice(detail.ProductID).toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </td>
                  <td className="py-2 px-3">{detail.OrderQuantity}</td>
                  <td className="py-2 px-3">
                    {new Date(detail.ExpectedDate).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-3">
                    {detail.ActualDate
                      ? new Date(detail.ActualDate).toLocaleDateString()
                      : "Chưa cập nhật"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <p className="font-semibold mb-4">
          <strong>Tổng tiền:</strong>{" "}
          {calculateTotalAmount().toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
          })}
        </p>

        <button
          onClick={() => navigate("/orders")}
          className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Quay lại danh sách
        </button>
      </div>
    </MainLayout>
  );
};

export default OrderDetailsPage;
