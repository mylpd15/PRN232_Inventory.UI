import axios from "axios";
import { SendOTPdto } from "../../common/dtos";


export const SendOTPservice={
    SendOTP: async (dto: SendOTPdto) => {
        const response = await axios.post(
          `${import.meta.env.VITE_SERVER_URL}/api/OTP/SendOTP`,
          dto,

        );
        localStorage.removeItem("user");
        localStorage.setItem("user", JSON.stringify(response.data));

      },
}