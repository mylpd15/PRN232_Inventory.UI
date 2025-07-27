import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AuthService } from '../../../services';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaLock } from 'react-icons/fa';
import { IoEye, IoEyeOff } from 'react-icons/io5';

interface PasswordFormValues {
  newPassword: string;
  confirmPassword: string;
}

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const togglePassword = () => setShowPassword((prev) => !prev);

  const initialValues: PasswordFormValues = {
    newPassword: '',
    confirmPassword: '',
  };

  const validationSchema = Yup.object().shape({
    newPassword: Yup.string()
      .required('New password is required')
      .min(6, 'At least 6 characters')
      .max(20, 'At most 20 characters'),
    confirmPassword: Yup.string()
      .required('Please confirm your password')
      .oneOf([Yup.ref('newPassword')], 'Passwords must match'),
  });

  const handleSubmit = async (
    values: PasswordFormValues,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    const token = AuthService.getAccessToken();
    const user = AuthService.getCurrentUser();

    if (!user || !token) {
      toast.error('Unauthorized');
      navigate('/login');
      return;
    }

    try {
      await AuthService.ChangePassword({
        old_Password: 'abc@123', // default for one-time login
        new_Password: values.newPassword,
        confirm_Password: values.confirmPassword,
      }, token);

      toast.success('Password changed successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen font-['Montserrat',sans-serif]">
      {/* Left Section */}
      <div className="w-1/2 bg-yellow-300 flex flex-col justify-center items-start px-24 py-16">
        <h1 className="text-5xl font-extrabold mb-4 text-black tracking-wide">WareSync</h1>
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 max-w-lg leading-snug">
          Welcome to WareSync
        </h2>
        <p className="text-md text-gray-700 mb-8 max-w-lg leading-relaxed">
          Please change your password to continue using WareSync safely and securely.
        </p>
        <img
          src="https://pyrops.com/wp-content/uploads/2023/02/Inventory-scaled.jpg"
          alt="Security"
          className="w-full rounded-xl shadow-xl border border-yellow-400"
        />
      </div>

      {/* Right Section */}
      <div className="w-1/2 bg-black text-white flex flex-col justify-center items-center px-16">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold mb-8">Change Password</h2>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form>
                {/* New Password */}
                <div className="mb-6 relative">
                  <FaLock className="absolute top-4 left-4 text-gray-400" />
                  <Field
                    name="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="New Password"
                    className="w-full pl-12 pr-12 py-3 rounded-md bg-black border border-gray-600 text-white focus:outline-none focus:border-yellow-300"
                  />
                  <div
                    className="absolute top-4 right-4 text-gray-400 cursor-pointer"
                    onClick={togglePassword}
                  >
                    {showPassword ? <IoEyeOff /> : <IoEye />}
                  </div>
                  <ErrorMessage name="newPassword" component="div" className="text-sm text-red-400 mt-1" />
                </div>

                {/* Confirm Password */}
                <div className="mb-6 relative">
                  <FaLock className="absolute top-4 left-4 text-gray-400" />
                  <Field
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm Password"
                    className="w-full pl-12 pr-12 py-3 rounded-md bg-black border border-gray-600 text-white focus:outline-none focus:border-yellow-300"
                  />
                  <ErrorMessage name="confirmPassword" component="div" className="text-sm text-red-400 mt-1" />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-yellow-300 text-black font-semibold rounded-md hover:bg-yellow-400 transition"
                >
                  {isSubmitting ? 'Changing...' : 'Change Password'}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}