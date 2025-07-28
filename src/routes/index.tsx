import { useRoutes } from "react-router-dom";
import { Home, NotFound } from "../pages";
import authRoutes from "./Auth";
import { Intro } from "../pages/Intro";
import userRoutes from "./Users";
import ProtectedRoute from "./ProtectedRoute";
import { CustomersPage, DeliveriesPage, DeliveryFormPage } from '../pages';
import ReportsPage from "../pages/Reports";

const Route = () => {
  const routes = useRoutes([
    {
      element: <ProtectedRoute />,
      children: [
        {
          path: "/",
          element: <Home />,
        },
        {
          path: "/overview",
          element: <Home />,
        },
        ...userRoutes,
        {
          path: "demo",
          element: <Intro />,
        },
        {
          path: "/customers",
          element: <CustomersPage />,
        },
        {
          path: "/deliveries",
          element: <DeliveriesPage />,
        },
        {
          path: "/deliveries/:customerId",
          element: <DeliveriesPage />,
        },
        {
          path: "/deliveries/add",
          element: <DeliveryFormPage />,
        },
        {
          path: "/deliveries/edit/:deliveryId",
          element: <DeliveryFormPage />,
        },

        {
          path: "/report",
          element: <ReportsPage />,
        },
      ],
    },
    ...authRoutes,
    {
      path: "*",
      element: <NotFound />,
    },
    {
      path: "demo",
      element: <Intro />,
    },
  ]);

  return routes;
};

export default Route;
