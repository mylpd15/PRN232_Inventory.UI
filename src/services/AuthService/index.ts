import axios from "axios";
import {
  ChangePassworddto,
  CreateUserDto,
  UserCredentialDto,
  VerifyOTPDto,
} from "../../common/dtos";
import { jwtDecode } from "jwt-decode";
import { UserRole } from "../../common/enums";
import { AppUser } from "../../interfaces";
import { ForgetPasswordDto } from "../../common/dtos/ForgetPassword/ForgetPasswordDto";
import { fbAuth } from "../../config";

export const AuthService = {
  isLogin: (): boolean => {
    return localStorage.getItem("accessToken") ? true : false;
  },
  getAccessToken: (): string => {
    const accessToken = localStorage.getItem("accessToken") ?? "";
    return AuthService.isTokenExpired(accessToken) ? "" : accessToken;
  },
  getCurrentUser: () => {
    const userJson = localStorage.getItem("user");
    return userJson !== null && AuthService.getAccessToken().length !== 0
      ? (JSON.parse(userJson) as AppUser)
      : null;
  },
  isTokenExpired: (token: string): boolean => {
    if (token.length == 0) {
      return true;
    }
    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decodedToken.exp ? decodedToken.exp < currentTime : true;
    } catch (error) {
      console.error("Error decoding token:", error);
      return true;
    }
  },
  login: async (dto: UserCredentialDto) => {
    const response = await axios.post(
      `${import.meta.env.VITE_SERVER_URL}/api/Auth/Login`,
      dto
    );
    localStorage.setItem("accessToken", response.data.accessToken.accessToken);
    localStorage.setItem("user", JSON.stringify(response.data.appUser));
  },
  googleLogin: async (idToken: string, userRole: UserRole) => {
    const response = await axios.post(
      `${import.meta.env.VITE_SERVER_URL}/api/Auth/GoogleSignIn`,
      {
        idToken,
        userRole,
      }
    );
    localStorage.setItem("accessToken", response.data.accessToken.accessToken);
    localStorage.setItem("user", JSON.stringify(response.data.appUser));
  },
  signup: async (dto: CreateUserDto) => {
    const response = await axios.post(
      `${import.meta.env.VITE_SERVER_URL}/api/Auth/Signup`,
      dto
    );
    localStorage.setItem("accessToken", response.data.accessToken.accessToken);
    localStorage.setItem("user", JSON.stringify(response.data.appUser));
    return {
      accessToken: response.data.accessToken.accessToken,
      user: response.data.appUser,
    };
  },
  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    fbAuth.signOut();
  },
  ForgetPassword: async (dto: ForgetPasswordDto) => {
    await axios.post(
      `${import.meta.env.VITE_SERVER_URL}/api/Auth/ForgetPassWord`,
      dto
    );
  },
  ChangePassword: async (dto: ChangePassworddto, accessToken: string) => {
    await axios.put(
      `${import.meta.env.VITE_SERVER_URL}/api/Auth/ChangePassWord`,
      dto,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  },
  VerifyOTP: async (dto: VerifyOTPDto) => {
    await axios.post(
      `${import.meta.env.VITE_SERVER_URL}/api/Auth/VerifyOTP`,
      dto
    );
  },
};
