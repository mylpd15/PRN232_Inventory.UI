import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { AuthService } from "../../../services";
import { UserRole } from "../../../common/enums";
import axios, { AxiosError } from "axios";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import styles from "./login.module.css";
import {
  Formik,
  Form,
  Field,
  ErrorMessage,
  FormikValues,
  FormikHelpers,
} from "formik";
import * as Yup from "yup";
import AOS from "aos";
import "aos/dist/aos.css";
import { fbAuth } from "../../../config";
interface LoginFormValues {
  username: string;
  password: string;
}

export function Login() {
  const navigate = useNavigate();

  const initialFormValues: LoginFormValues = {
    username: "",
    password: "",
  };

  const validationSchema = Yup.object().shape({
    username: Yup.string()
      .required("Username is required")
      .min(5, "Username must be at least 5 characters")
      .max(15, "Username must be at maximum 15 characters"),
    password: Yup.string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters")
      .max(20, "Password must be at maximum 20 characters"),
  });

  useEffect(() => {
    AOS.init();
  }, []);

  const handleLogin = async (
    values: FormikValues,
    { setSubmitting }: FormikHelpers<LoginFormValues>
  ) => {
    const { username, password } = values;
    try {
      await AuthService.login({ username, password });
      if (AuthService.getCurrentUser()?.userRole == UserRole.Admin)
        navigate("/users");
      else navigate("/");
    } catch (err) {
      console.error("Login failed:", err);

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

  const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
    const { credential } = credentialResponse;
    if (credential) {
      try {
        const fbAuthCredential =
          firebase.auth.GoogleAuthProvider.credential(credential);
        fbAuth.signInWithCredential(fbAuthCredential);

        await AuthService.googleLogin(credential, UserRole.WarehouseStaff);
        navigate("/");
      } catch (err) {
        console.error("Google authentication failed:", err);
      }
    }
  };

  const labelCharStyles = (index: number) =>
    ({
      "--index": index.toString(),
    } as React.CSSProperties);

  return (
    <div data-aos="zoom-in-left" data-aos-duration="1000">
      <div className="font-[sans-serif] text-[#333] bg-white">
        <div className="min-h-screen flex flex-col items-center justify-center">
          <div className="grid md:grid-cols-2 items-center gap-4 max-w-6xl w-full p-4 m-4 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.3)] rounded-md">
            <div className="md:max-w-md w-full sm:px-6 py-4">
              <Formik
                initialValues={initialFormValues}
                validationSchema={validationSchema}
                onSubmit={handleLogin}
              >
                {({ isSubmitting }) => (
                  <Form>
                    {/* Form elements here */}
                    <div className="mb-12">
                      <h3 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-600">
                        Sign in
                      </h3>
                      <p className="text-sm mt-4 ">
                        Don't have an account{" "}
                        <a
                          href="/auth/signup"
                          className="font-semibold hover:underline ml-1 whitespace-nowrap bg-gradient-to-r from-sky-400 to-indigo-600 bg-clip-text text-transparent"
                        >
                          Register here
                        </a>
                      </p>
                      {/* Other form fields and buttons */}
                    </div>

                    {/* Username field */}
                    <div>
                      <label
                        htmlFor="username"
                        className="text-xs block mb-2 font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-600 text-lg"
                      >
                        Username or Email
                      </label>
                      <Field
                        id="username"
                        name="username"
                        type="text"
                        className="w-full text-sm border-b border-gray-300 focus:border-[#333] px-2 py-3 outline-none"
                      />
                      <ErrorMessage
                        id="username-error"
                        className={styles.error}
                        // "text-red-500 p-5 bg-white font-medium text-xs"
                        name="username"
                        component="div"
                      />
                    </div>
                    {/* <div className={styles['wave-group']}>
                      <input required type="text" className={styles.input} />
                      <span className={styles.bar}></span>
                      <label className={styles.label}>
                        <span className={styles['label-char']} style={labelCharStyles(0)}>U</span>
                        <span className={styles['label-char']} style={labelCharStyles(1)}>s</span>
                        <span className={styles['label-char']} style={labelCharStyles(2)}>e</span>
                        <span className={styles['label-char']} style={labelCharStyles(3)}>r</span>
                        <span className={styles['label-char']} style={labelCharStyles(0)}>n</span>
                        <span className={styles['label-char']} style={labelCharStyles(1)}>a</span>
                        <span className={styles['label-char']} style={labelCharStyles(2)}>m</span>
                        <span className={styles['label-char']} style={labelCharStyles(3)}>e</span>
                      </label>
                    </div> */}

                    {/* Password field */}
                    <div className="mt-8">
                      <label
                        htmlFor="password"
                        className="text-xs block mb-2 font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-600 text-lg"
                      >
                        Password
                      </label>
                      <Field
                        id="password"
                        name="password"
                        type="password"
                        className="w-full text-sm border-b border-gray-300 focus:border-[#333] px-2 py-3 outline-none"
                      />
                      <ErrorMessage
                        id="password-error"
                        className={styles.error}
                        // "text-red-500 p-5 bg-white font-medium text-xs"
                        name="password"
                        component="div"
                      />
                    </div>

                    {/* Remember me checkbox and Forgot Password link */}
                    <div className="flex items-center justify-between gap-2 mt-5">
                      {/* Remember me checkbox */}
                      <div className="flex items-center">
                        <Field
                          id="remember-me"
                          name="remember-me"
                          type="checkbox"
                          className="h-4 w-4 shrink-0 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor="remember-me"
                          className="ml-3 block text-sm"
                        >
                          Remember me
                        </label>
                      </div>

                      {/* Forgot Password link */}
                      <div>
                        <a
                          href="/auth/SendOTP"
                          className="font-semibold text-sm hover:underline bg-gradient-to-r from-sky-400 to-indigo-600 bg-clip-text text-transparent"
                        >
                          Forgot Password?
                        </a>
                      </div>
                    </div>

                    {/* Submit button */}
                    <div className="mt-12">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full shadow-xl py-2.5 px-4 text-sm font-semibold rounded-full text-white bg-gradient-to-r to-indigo-600 from-sky-400 hover:bg-blue-700 focus:outline-none"
                      >
                        Sign in
                      </button>
                    </div>

                    {/* Additional content */}
                    <p className="my-8 text-sm text-gray-400 text-center">
                      or continue with
                    </p>
                    <div className="space-x-8 flex justify-center">
                      {/* Google Login component or other integrations */}
                      <div className="google-login-button-class">
                        <GoogleLogin
                          onSuccess={handleGoogleLogin}
                          onError={() => {
                            console.log("Login with Google Failed");
                          }}
                        />
                      </div>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
            <div className="md:h-full max-md:mt-10  rounded-xl ">
              <img
                src="/src/assets/login-bg.png"
                className="w-full h-full object-contain"
                alt="login-image"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
