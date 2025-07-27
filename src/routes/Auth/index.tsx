import { ChangePassword, ChangePasswordPage, ForgetPassword, Login, Signup,UserProfile,VerifyOTP } from "../../pages";
import OneTimeLoginPage from "../../pages/Auth/OneTimeLogin";
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
  },
  {
    path:"/auth/one-time-login",
    element:<OneTimeLoginPage />
  },
   {
    path:"/auth/change-initial-password",
    element:<ChangePasswordPage />
  },
  {
    path:"/auth/profile",
    element:<UserProfile />
  }
];

export default authRoutes;