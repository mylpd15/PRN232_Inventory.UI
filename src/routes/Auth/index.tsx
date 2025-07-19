import { ChangePassword, ForgetPassword, Login, Signup,VerifyOTP } from "../../pages";
import { SendOTP } from "../../pages/Auth/SendOTP";

const authRoutes = [
  {
    path: "/auth/login",
    element: <Login />,
  },
  {
    path: "/auth/signup",
    element: <Signup />,
  },
  {
    path: "/auth/SendOTP",
    element: <SendOTP />,
  },
  {
    path: "/auth/Forgetpassword",
    element: <ForgetPassword />,
  },
  {
    path: "/auth/ChangePassword",
    element: <ChangePassword />,
  },
  {
    path:"/auth/VerifyOTP",
    element:<VerifyOTP />
  }
];

export default authRoutes;