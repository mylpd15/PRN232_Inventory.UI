import React, { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { getOrders, updateOrderStatus } from "../../services/OrderService";
import { toast } from "react-hot-toast";

interface Provider {
  ProviderName?: string;
}

interface Warehouse {
  WarehouseName?: string;
}

interface Order {
  OrderID: number;
  OrderDate: string;
  Status: string;
  RejectReason?: string;
  Provider?: Provider;
  Warehouse?: Warehouse;
}

const ManageOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("Pending");

  // Popup modal states
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectOrderId, setRejectOrderId] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getOrders();
      const filtered = data.filter((o: Order) => o.Status === statusFilter);
      setOrders(filtered);
    } catch (err: any) {
      toast.error(err?.message || "Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    orderId: number,
    status: string,
    reason?: string
  ) => {
    try {
      await updateOrderStatus(orderId, status, reason);
      toast.success(`Cập nhật trạng thái đơn hàng #${orderId} thành công!`);
      fetchOrders();
    } catch (err: any) {
      toast.error(err?.message || "Cập nhật trạng thái thất bại");
    }
  };

  const handleRejectClick = (orderId: number) => {
    setRejectOrderId(orderId);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    if (rejectOrderId !== null) {
      handleUpdateStatus(rejectOrderId, "Rejected", rejectReason);
    }
    setShowRejectModal(false);
  };

  const renderStatusBadge = (status: string) => {
    let colorClass = "bg-gray-200 text-gray-800";
    switch (status) {
      case "Pending":
        colorClass = "bg-yellow-100 text-yellow-700";
        break;
      case "Approved":
        colorClass = "bg-blue-100 text-blue-700";
        break;
      case "Rejected":
        colorClass = "bg-red-100 text-red-700";
        break;
      case "Completed":
        colorClass = "bg-green-100 text-green-700";
        break;
    }
    return (
      <span
        className={`px-2 py-1 text-sm rounded-full font-medium ${colorClass}`}
      >
        {status}
      </span>
    );
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-full mx-auto">
        <h2 className="text-2xl font-bold mb-4">Quản lý Trạng thái Đơn hàng</h2>

        <div className="mb-4 flex items-center gap-4">
          <label className="font-medium">Lọc theo trạng thái:</label>
          <select
            className="border rounded px-2 py-1"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {loading ? (
          <p>Đang tải đơn hàng...</p>
        ) : orders.length === 0 ? (
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
                  <th className="py-3 px-4 text-left">Trạng thái</th>
                  <th className="py-3 px-4 text-left">Hành động</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {orders.map((order) => (
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
                      {renderStatusBadge(order.Status)}
                    </td>
                    <td className="py-3 px-4 flex gap-2">
                      {(order.Status === "Pending" ||
                        order.Status === "Approved") && (
                        <>
                          {order.Status !== "Approved" && (
                            <button
                              className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                              onClick={() =>
                                handleUpdateStatus(order.OrderID, "Approved")
                              }
                            >
                              Approve
                            </button>
                          )}
                          <button
                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                            onClick={() => handleRejectClick(order.OrderID)}
                          >
                            Reject
                          </button>
                          <button
                            className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                            onClick={() =>
                              handleUpdateStatus(order.OrderID, "Completed")
                            }
                          >
                            Complete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Reject Reason Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Nhập lý do từ chối</h3>
              <textarea
                className="border rounded w-full p-2 mb-4"
                rows={3}
                placeholder="Nhập lý do..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                  onClick={() => setShowRejectModal(false)}
                >
                  Hủy
                </button>
                <button
                  className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                  onClick={confirmReject}
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ManageOrdersPage;
