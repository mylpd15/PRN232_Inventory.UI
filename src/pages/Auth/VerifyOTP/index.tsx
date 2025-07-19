import { useState } from "react";
import { AuthService } from "../../../services";
import { useLocation, useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { toast } from "react-hot-toast";

export function VerifyOTP() {
    const [otP1, setOTP1] = useState('');
    const [otP2, setOTP2] = useState('');
    const [otP3, setOTP3] = useState('');
    const [otP4, setOTP4] = useState('');
    const handleInputOtp1 = (event: React.ChangeEvent<HTMLInputElement>) => {
        setOTP1(event.target.value);
    }
    const handleInputOtp2 = (event: React.ChangeEvent<HTMLInputElement>) => {
        setOTP2(event.target.value);
    }
    const handleInputOtp3 = (event: React.ChangeEvent<HTMLInputElement>) => {
        setOTP3(event.target.value);
    }
    const handleInputOtp4 = (event: React.ChangeEvent<HTMLInputElement>) => {
        setOTP4(event.target.value);
    }
    const navigate = useNavigate();
    const location = useLocation();
    const { state } = location;
    const { email } = state;
    const [error, setError] = useState<AxiosError | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const handleSaveClick = async () => {

        try {

             await AuthService.VerifyOTP({
                email,
                otP1,
                otP2,
                otP3,
                otP4
            });

            navigate("/auth/Forgetpassword", { state: { email } });

        } catch (err) {
            console.error("verify failed:", err);
            
            
            



            if (axios.isAxiosError(err)) {
              const axiosError = err as AxiosError<any>; // Use any for generic AxiosError
      
              if (axiosError.response) {
                const { data } = axiosError.response;
                if (otP1 == ''||otP2 == '' ||otP3 == ''|| otP4 == '' ) {
                  toast.error("Please Enter OTP");
              }
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
        <div className="max-w-md mx-auto text-center bg-white px-4 sm:px-8 py-10 rounded-xl shadow">
            <header className="mb-8">
                <h1 className="text-2xl font-bold mb-1">Mobile Phone Verification</h1>
                <p className="text-[15px] text-slate-500">Enter the 4-digit verification code that was sent to your phone number.</p>
            </header>
            <form id="otp-form">
                <div className="flex items-center justify-center gap-3">
                    <input 
                        value={otP1}
                        onChange={handleInputOtp1}
                        type="text"
                        className="w-14 h-14 text-center text-2xl font-extrabold text-slate-900 bg-slate-100 border border-transparent hover:border-slate-200 appearance-none rounded p-4 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                        pattern="\d*" maxLength={1} />
                    <input 
                        value={otP2}
                        onChange={handleInputOtp2}

                        type="text"
                        className="w-14 h-14 text-center text-2xl font-extrabold text-slate-900 bg-slate-100 border border-transparent hover:border-slate-200 appearance-none rounded p-4 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                        maxLength={1} />
                    <input 
                        value={otP3}
                        onChange={handleInputOtp3}

                        type="text"
                        className="w-14 h-14 text-center text-2xl font-extrabold text-slate-900 bg-slate-100 border border-transparent hover:border-slate-200 appearance-none rounded p-4 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                        maxLength={1} />
                    <input 
                        value={otP4}
                        onChange={handleInputOtp4}

                        type="text"
                        className="w-14 h-14 text-center text-2xl font-extrabold text-slate-900 bg-slate-100 border border-transparent hover:border-slate-200 appearance-none rounded p-4 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                        maxLength={1} />
                </div>
                <p className="text-sm text-red-500 p-4 text-center">
                    {message}
                </p>
                <div className="max-w-[260px] mx-auto mt-4">
                    <button
                        onClick={handleSaveClick}
                        type="button"
                        className="w-full inline-flex justify-center whitespace-nowrap rounded-lg bg-indigo-500 px-3.5 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-950/10 hover:bg-indigo-600 focus:outline-none focus:ring focus:ring-indigo-300 focus-visible:outline-none focus-visible:ring focus-visible:ring-indigo-300 transition-colors duration-150">Verify
                        Account</button>
                </div>
            </form>
            <div className="text-sm text-slate-500 mt-4">Didn't receive code? <a className="font-medium text-indigo-500 hover:text-indigo-600" href="/auth/SendOTP">Resend</a></div>
        </div>
    );
}