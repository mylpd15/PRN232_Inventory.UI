import { useRoutes } from "react-router-dom";
import { Home, NotFound } from "../pages";
import authRoutes from "./Auth";
import { Intro } from "../pages/Intro";
import userRoutes from "./Users";
import ProtectedRoute from "./ProtectedRoute";

const Route = () => {
  const routes = useRoutes([
    {
      element: <ProtectedRoute />,
      children: [
        {
          path: "/",
          element: <Home />,
        },
        ...userRoutes,
        {
          path: "demo",
          element: <Intro />,
        },
      ],
    },
    ...authRoutes,
    {
      path: "*",
      element: <NotFound />,
    },
  ]);

  return routes;
};

export default Route;
