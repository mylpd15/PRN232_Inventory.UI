import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../../../services";
import { UserRole } from "../../../common/enums";
import * as Yup from "yup"; //buoc1
import styles from "./signup.module.css";

//buoc2
import {
  Formik,
  Form,
  Field,
  ErrorMessage,
  FormikValues,
  FormikHelpers,
} from "formik";
import AOS from "aos";
import "aos/dist/aos.css";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
//buoc3
const validationSchema = Yup.object().shape({
  username: Yup.string()
    .required("Username is required")
    .min(5, "Username must be at least 5 characters")
    .max(15, "Username must be at maximum 15 characters"),
  password: Yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(20, "Password must be at maximum 20 characters")
    .matches(
      /^(?=.*[A-Z])(?=.*[!@#?]).{5,15}$/,
      "Password must contain at least one uppercase letter and one special character (! @ # ?)"
    ),
  confirmPassword: Yup.string()
    .required("Confirm Password is required")
    .oneOf([Yup.ref("password")], "Passwords must match"),
  email: Yup.string()
    .required("Email is required")
    .email("Invalid email format"),
});

//buoc4: de tat ca trong form vao day
interface SignUpFormValues {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
}

export function Signup() {
  const initialFormValues: SignUpFormValues = {
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
  };

  useEffect(() => {
    AOS.init();
  }, []);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.WarehouseStaff);

  const handleUseRole = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedRole = Number(event.target.value) as UserRole; // Explicitly cast to UserRole
    setUserRole(selectedRole);
    console.log(selectedRole);
  };
  //Show password
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const navigate = useNavigate();

  const handleSignup = async (
    values: FormikValues,
    { setSubmitting }: FormikHelpers<SignUpFormValues>
  ) => {
    try {
      const { username, password, email, confirmPassword } = values;

      const { accessToken, user } = await AuthService.signup({
        email,
        username,
        password,
        confirmPassword,
        userRole,
      });

      if (user.userRole === UserRole.WarehouseManager) {
        navigate("/add-tutor-detail", {
          state: { accessToken, user },
        });
      } else if (user.userRole === UserRole.WarehouseStaff) {
        navigate("/add-learner-detail", {
          state: { accessToken, user },
        });
      }
    } catch (err) {
      console.error("Signup failed:", err);
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<any>; // Use any for generic AxiosError

        if (axiosError.response) {
          const { data } = axiosError.response;

          if (data) {
            if (data.errors) {
              // Handle validation errors
              Object.values(data.errors).forEach((errMsgList) => {
                (errMsgList as string[]).forEach((errMsg: string) => {
                  toast.error(errMsg);
                });
              });
            } else if (data.message) {
              // Handle API exceptions
              toast.error(data.message);
            }
          } else {
            toast.error("An unknown error occurred.");
          }
        }
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div data-aos="zoom-in-left" data-aos-duration="1000">
      <div className="font-[sans-serif] bg-white text-white">
        <div className="grid md:grid-cols-2 items-center gap-8 h-full">
          <div className="max-md:order-1 p-4">
            <img
              src="/src/assets/login-bg.png"
              className="lg:max-w-[90%] w-full h-full object-contain block mx-auto"
              alt="login-image"
            />
          </div>
          <div className="flex items-center md:p-8 p-6 bg-gradient-to-r from-sky-400/1 to-indigo-600/2 h-full lg:w-11/12 lg:ml-auto">
            <Formik
              initialValues={initialFormValues}
              validationSchema={validationSchema}
              onSubmit={handleSignup}
            >
              {({ isSubmitting }) => (
                <Form>
                  <div className="max-w-lg w-full mx-auto">
                    <div className="mb-12">
                      <h3 className="text-3xl font-bold bg-gradient-to-r from-sky-400 to-indigo-600 bg-clip-text text-transparent">
                        Create an account
                      </h3>
                    </div>
                    <div>
                      <label className="text-xs block mb-2 font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-600 text-lg-50">
                        Username
                      </label>
                      <div className="relative flex items-center">
                        <Field
                          name="username"
                          id="username"
                          type="text"
                          required
                          className="w-full bg-transparent text-black border-b border-gray-300 focus:border-yellow-400 px-2 py-3 outline-none"
                          placeholder="Enter username"
                        />

                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="#bbb"
                          stroke="#bbb"
                          className="w-[18px] h-[18px] absolute right-2"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            cx={10}
                            cy={7}
                            r={6}
                            data-original="#000000"
                          />
                          <path
                            d="M14 15H6a5 5 0 0 0-5 5 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 5 5 0 0 0-5-5zm8-4h-2.59l.3-.29a1 1 0 0 0-1.42-1.42l-2 2a1 1 0 0 0 0 1.42l2 2a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42l-.3-.29H22a1 1 0 0 0 0-2z"
                            data-original="#000000"
                          />
                        </svg>
                      </div>
                      <ErrorMessage
                        id="username-error"
                        className={styles.error}
                        name="username"
                        component="div"
                      />
                    </div>

                    <div className="mt-8">
                      <label className="text-xs block mb-2 font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-600 text-lg">
                        Password
                      </label>
                      <div className="relative flex items-center">
                        <Field
                          name="password"
                          id="password"
                          type={showPassword ? "text" : "password"}
                          required
                          className="w-full bg-transparent text-gray-400 text-sm border-b border-gray-300 focus:border-yellow-400 px-2 py-3 outline-none"
                          placeholder="Enter password"
                        />

                        <svg
                          onClick={togglePasswordVisibility}
                          xmlns="http://www.w3.org/2000/svg"
                          fill="#bbb"
                          stroke="#bbb"
                          className="w-[18px] h-[18px] absolute right-2 cursor-pointer"
                          viewBox="0 0 128 128"
                        >
                          <path
                            d="M64 104C22.127 104 1.367 67.496.504 65.943a4 4 0 0 1 0-3.887C1.367 60.504 22.127 24 64 24s62.633 36.504 63.496 38.057a4 4 0 0 1 0 3.887C126.633 67.496 105.873 104 64 104zM8.707 63.994C13.465 71.205 32.146 96 64 96c31.955 0 50.553-24.775 55.293-31.994C114.535 56.795 95.854 32 64 32 32.045 32 13.447 56.775 8.707 63.994zM64 88c-13.234 0-24-10.766-24-24s10.766-24 24-24 24 10.766 24 24-10.766 24-24 24zm0-40c-8.822 0-16 7.178-16 16s7.178 16 16 16 16-7.178 16-16-7.178-16-16-16z"
                            data-original="#000000"
                          />
                        </svg>
                      </div>

                      <ErrorMessage
                        id="password-error"
                        className={styles.error}
                        name="password"
                        component="div"
                      />
                    </div>
                    <div className="mt-8">
                      <label className="text-xs block mb-2 font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-600 text-lg">
                        Confirm Password
                      </label>
                      <div className="relative flex items-center">
                        <Field
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          id="confirmPassword"
                          required
                          className="w-full bg-transparent text-gray-400 text-sm border-b border-gray-300 focus:border-yellow-400 px-2 py-3 outline-none"
                          placeholder="Confirm password"
                        />

                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="#bbb"
                          stroke="#bbb"
                          className="w-[18px] h-[18px] absolute right-2 cursor-pointer"
                          viewBox="0 0 128 128"
                          onClick={toggleConfirmPasswordVisibility}
                        >
                          <path
                            d="M64 104C22.127 104 1.367 67.496.504 65.943a4 4 0 0 1 0-3.887C1.367 60.504 22.127 24 64 24s62.633 36.504 63.496 38.057a4 4 0 0 1 0 3.887C126.633 67.496 105.873 104 64 104zM8.707 63.994C13.465 71.205 32.146 96 64 96c31.955 0 50.553-24.775 55.293-31.994C114.535 56.795 95.854 32 64 32 32.045 32 13.447 56.775 8.707 63.994zM64 88c-13.234 0-24-10.766-24-24s10.766-24 24-24 24 10.766 24 24-10.766 24-24 24zm0-40c-8.822 0-16 7.178-16 16s7.178 16 16 16 16-7.178 16-16-7.178-16-16-16z"
                            data-original="#000000"
                          />
                        </svg>
                      </div>
                      <ErrorMessage
                        id="confirmPassword-error"
                        className={styles.error}
                        name="confirmPassword"
                        component="div"
                      />
                    </div>
                    <div className="mt-8">
                      <label className="text-xs block mb-2 font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-600 text-lg">
                        Email
                      </label>
                      <div className="relative flex items-center">
                        <Field
                          id="email"
                          name="email"
                          type="text"
                          required
                          className="w-full bg-transparent text-gray-400 text-sm border-b border-gray-300 focus:border-yellow-400 px-2 py-3 outline-none"
                          placeholder="Email"
                        />
                      </div>
                      <ErrorMessage
                        id="email-error"
                        className={styles.error}
                        name="email"
                        component="div"
                      />
                    </div>
                    <div className="flex justify-around gap-10 mt-10 items-center">
                      <div className="">
                        <label className="text-xs block mb-2 font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-600 text-lg">
                          Role
                        </label>
                        <div className="flex items-center mb-4">
                          <input
                            defaultChecked
                            type="radio"
                            name="userRole"
                            id="tutor-radio"
                            value={UserRole.WarehouseStaff}
                            onChange={handleUseRole}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          />

                          <label
                            htmlFor="learner-radio"
                            className="ms-2 text-sm font-medium text-gray-400 dark:text-white dark:border-gray-400"
                          >
                            Learner
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="userRole"
                            id="learner-radio"
                            value={UserRole.WarehouseManager}
                            onChange={handleUseRole}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          />

                          <label
                            htmlFor="default-radio-2"
                            className="ms-2 text-sm font-medium text-gray-400 dark:text-white dark:border-gray-400"
                          >
                            Tutor
                          </label>
                        </div>
                        <ErrorMessage
                          className={styles.error}
                          name="userRole"
                          component="div"
                        />
                      </div>

                      <div
                        className="flex p-4 text-sm text-gray-400 rounded-lg bg-gradient-to-r from-sky-400/20 to-indigo-600/20 h-full lg:w-11/12 lg:ml-auto"
                        role="alert"
                      >
                        <svg
                          className="flex-shrink-0 inline w-4 h-4 me-3"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                        </svg>
                        <span className="sr-only">Info</span>
                        <div>
                          <span className="font-medium">
                            Ensure that these requirements are met:
                          </span>
                          <ul className="mt-1.5 list-disc list-inside">
                            <li>
                              At least 6 characters (and up to 20 characters)
                            </li>
                            <li>At least one upper character</li>
                            <li>
                              Inclusion of at least one special character, e.g.,
                              ! @ # ?
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="mt-12">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="relative w-max shadow-xl py-2.5 px-8 text-sm font-semibold rounded-md bg-gradient-to-r from-sky-400 to-indigo-600 text-transparent border-transparent bg-clip-border before:absolute before:inset-0 before:rounded-md before:bg-white before:bg-gradient-to-r before:from-sky-400 before:to-indigo-600 before:p-[1px] before:-z-10 before:content-['']"
                      >
                        <span className="bg-clip-text text-transparent text-white dark:text-white">
                          Register
                        </span>
                      </button>

                      <p className="font-semibold ml-1 hover:underline text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-600">
                        Already have an account?{" "}
                        <a
                          href="/auth/login"
                          className="font-semibold ml-1 hover:underline text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-600"
                        >
                          Login here
                        </a>
                      </p>
                    </div>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
}
