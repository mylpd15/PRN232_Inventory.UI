import axios from "axios";
import { AuthService } from "../AuthService";

export const NotificationService = {
  getLatestNotifications: async () => {
    const notifications = await axios.get(
      `${import.meta.env.VITE_SERVER_URL}/api/Notification/Latest`,
      {
        headers: {
          Authorization: `Bearer ${AuthService.getAccessToken()}`,
        },
      }
    );
    return notifications;
  },
  
};
