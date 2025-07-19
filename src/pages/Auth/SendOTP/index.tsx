import { useState } from "react";
import { SendOTPservice } from "../../../services/SendOTPservice";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import axios, { AxiosError } from "axios";


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
interface SendOTPFormValues {
    email: string;

}
const validationSchema = Yup.object().shape({
    email: Yup.string().required('Email is required')

});
export function SendOTP() {
    const initialFormValues: SendOTPFormValues = {
        email: ""

    };
    const navigate = useNavigate();
    const location = useLocation();
    const { state } = location;

    const handleSaveClick = async (values: FormikValues,
        { setSubmitting }: FormikHelpers<SendOTPFormValues>) => {
        const { email } = values;
        try {

            await SendOTPservice.SendOTP({ email }
            )
            navigate("/auth/VerifyOTP", { state: { email } })

        } catch (err) {

            console.error("Send Fail", err)
            const error = err as AxiosError;
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


        }
    }


    return (

        <main id="content" role="main" className="w-full max-w-md mx-auto p-6 mt-20">
            <div className="mt-7 bg-white rounded-xl shadow-lg dark:bg-gray-800 dark:border-gray-700 border-2 border-indigo-300">
                <div className="p-4 sm:p-7">
                    <div className="text-center">
                        <h1 className="block text-2xl font-bold text-gray-800 dark:text-white">Forgot password?</h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Remember your password?
                            <a className="text-blue-600 decoration-2 hover:underline font-medium" href="/auth/Login">
                                Login here
                            </a>
                        </p>
                    </div>

                    <div className="mt-5">
                        <Formik
                            initialValues={initialFormValues}
                            validationSchema={validationSchema}
                            onSubmit={handleSaveClick}
                        >
                            {({ isSubmitting }) => (
                                <Form>
                                    <div className="grid gap-y-4">
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-bold ml-1 mb-2 dark:text-white">Email address</label>
                                            <div className="relative" >
                                                <Field  // Bind input value to state variable
                                                    type="email" id="email" name="email" className="py-3 px-4 block w-full border-2 border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm" required aria-describedby="email-error" />
                                                <ErrorMessage
                                                    className="text-red-500 p-5 bg-white font-medium text-xs"
                                                    
                                                    name="email"
                                                    component="div"
                                                />
                                            </div>

                                            <p className="hidden text-xs text-red-600 mt-2" id="email-error">Please include a valid email address so we can get back to you</p>
                                        </div>
                                        <button disabled={isSubmitting} type="submit" className="py-3 px-4 inline-flex justify-center items-center gap-2 rounded-md border border-transparent font-semibold bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-sm dark:focus:ring-offset-gray-800">Send OTP</button>
                                    </div>
                                </Form>
                            )}
                        </Formik>

                    </div>
                </div>
            </div>


        </main>);
}