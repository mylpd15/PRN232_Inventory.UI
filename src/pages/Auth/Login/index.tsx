import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AuthService } from '../../../services';
import { UserRole } from '../../../common/enums';
import axios, { AxiosError } from 'axios';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import * as Yup from 'yup';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { IoEye, IoEyeOff } from 'react-icons/io5';
import { fbAuth } from '../../../config';

interface LoginFormValues {
  username: string;
  password: string;
}

export function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const togglePassword = () => setShowPassword((prev) => !prev);

  const initialValues: LoginFormValues = {
    username: '',
    password: '',
  };

  const validationSchema = Yup.object().shape({
    username: Yup.string()
      .required('Username is required')
      .min(5, 'At least 5 characters')
      .max(15, 'At most 15 characters'),
    password: Yup.string()
      .required('Password is required')
      .min(6, 'At least 6 characters')
      .max(20, 'At most 20 characters'),
  });

  const handleLogin = async (
    values: LoginFormValues,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    try {
      await AuthService.login(values);
      const user = AuthService.getCurrentUser();
      if (user?.userRole === UserRole.Admin) navigate('/users');
      else navigate('/');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<any>;
        const data = axiosError.response?.data;

        if (data?.errors) {
          Object.values(data.errors).forEach((msgs) =>
            (msgs as string[]).forEach((msg) => toast.error(msg))
          );
        } else if (data?.message) {
          toast.error(data.message);
        } else {
          toast.error('An unknown error occurred.');
        }
      } else {
        toast.error('An unexpected error occurred.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
    const { credential } = credentialResponse;
    if (credential) {
      try {
        const fbCredential = firebase.auth.GoogleAuthProvider.credential(credential);
        await fbAuth.signInWithCredential(fbCredential);
        await AuthService.googleLogin(credential, UserRole.WarehouseStaff);
        navigate('/');
      } catch (error) {
        console.error('Google login error:', error);
        toast.error('Google login failed');
      }
    }
  };

  return (
    <div className="flex h-screen font-['Montserrat',sans-serif]">
      {/* Left section */}
      <div className="w-1/2 bg-yellow-300 flex flex-col justify-center items-start px-24 py-16">
        <h1 className="text-5xl font-extrabold mb-4 text-black tracking-wide">WareSync</h1>
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 max-w-lg leading-snug">
          Smart Warehouse Management Platform
        </h2>
        <p className="text-md text-gray-700 mb-8 max-w-lg leading-relaxed">
          Optimize your inventory, streamline operations, and manage your warehouse seamlessly from anywhere — anytime.
        </p>
        <img
          src="https://pyrops.com/wp-content/uploads/2023/02/Inventory-scaled.jpg"
          alt="Warehouse Preview"
          className="w-full rounded-xl shadow-xl border border-yellow-400"
        />
      </div>

      {/* Right section */}
      <div className="w-1/2 bg-black text-white flex flex-col justify-center items-center px-16">
        <div className="w-full max-w-md">
          <h2 className="text-4xl font-bold mb-8">Log in to WareSync</h2>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleLogin}
          >
            {({ isSubmitting }) => (
              <Form>
                {/* Username */}
                <div className="mb-6 relative">
                  <FaEnvelope className="absolute top-4 left-4 text-gray-400" />
                  <Field
                    name="username"
                    type="text"
                    placeholder="Username or email"
                    className="w-full pl-12 pr-4 py-3 rounded-md bg-black border border-gray-600 text-white focus:outline-none focus:border-yellow-300"
                  />
                  <ErrorMessage name="username" component="div" className="text-sm text-red-400 mt-1" />
                </div>

                {/* Password */}
                <div className="mb-6 relative">
                  <FaLock className="absolute top-4 left-4 text-gray-400" />
                  <Field
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3 rounded-md bg-black border border-gray-600 text-white focus:outline-none focus:border-yellow-300"
                  />
                  <div
                    className="absolute top-4 right-4 text-gray-400 cursor-pointer"
                    onClick={togglePassword}
                  >
                    {showPassword ? <IoEyeOff /> : <IoEye />}
                  </div>
                  <ErrorMessage name="password" component="div" className="text-sm text-red-400 mt-1" />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-yellow-300 text-black font-semibold rounded-md hover:bg-yellow-400 transition"
                >
                  {isSubmitting ? 'Signing in...' : 'Sign in'}
                </button>
              </Form>
            )}
          </Formik>

          <div className="text-sm text-gray-400 mt-4">
            Forgot password?{' '}
            <a href="/auth/SendOTP" className="text-yellow-300 hover:underline">
              Send email
            </a>
          </div>

          <div className="flex items-center my-6">
            <hr className="flex-grow border-gray-600" />
            <span className="mx-3 text-gray-500">Or</span>
            <hr className="flex-grow border-gray-600" />
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => toast.error('Google login failed')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
