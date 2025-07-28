import { Routes, Route } from "react-router-dom";
import OrdersPage from "../../pages/Orders";
import CreateOrderPage from "../../pages/Orders/CreateOrder";
import OrderDetailPage from "../../pages/Orders/OrderDetailsPage";
import ManageOrderPage from "../../pages/Orders/ManageOrdersPage";
import EditOrderPage from "../../pages/Orders/EditOrderPage";

const OrdersRoute = () => {
  return (
    <Routes>
      <Route path="/" element={<OrdersPage />} />
      <Route path="create" element={<CreateOrderPage />} />
      <Route path=":orderId" element={<OrderDetailPage />} />
      <Route path="manage" element={<ManageOrderPage />} />
      <Route path=":orderId/edit" element={<EditOrderPage />} />
    </Routes>
  );
};

export default OrdersRoute;
