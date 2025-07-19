import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthService } from "../../../services";
import { toast } from "react-hot-toast";

export default function OneTimeLoginPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get("token");
        if (!token) {
            toast.error("Invalid or missing token.");
            return;
        }

        AuthService.oneTimeLogin(token)
            .then(() => {
                toast.success("Login successful!");
                navigate("/auth/change-initial-password");
            })
            .catch(() => {
                toast.error("Token expired or invalid.");
            });
    }, []);


    return <div className="text-center mt-20 text-lg">Logging in...</div>;
}
