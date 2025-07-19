import { AddUserDto, AppUser } from './../../interfaces/AppUser';
import axios from 'axios';

const baseApiUrl = import.meta.env.VITE_SERVER_URL;
const baseOdataUrl = `${baseApiUrl}/odata/UsersOdata`;

export const UserService = {
  getUsers: async (): Promise<AppUser[]> => {
    const response = await axios.get(`${baseApiUrl}/api/users`);
    return response.data;
  },

  async getUsersOData(params: Record<string, any>) {
    const query = new URLSearchParams(params);
    const response = await axios.get(`${baseOdataUrl}?${query.toString()}`);

    const rawUsers = response.data.value;

    const users = rawUsers.map((user: any) => ({
      id: user.Id,
      displayName: user.DisplayName,
      username: user.Username,
      email: user.Email,
      isDisabled: user.IsDisabled,
      userRole: user.UserRole,
    }));

    return {
      users,
      count: response.data['@odata.count'] ?? rawUsers.length,
    };
  },

  addUser: async (dto: AddUserDto): Promise<AppUser> => {
    const response = await axios.post(`${baseApiUrl}/api/users`, dto);
    return response.data;
  },

  updateUser: async (id: string, dto: AddUserDto): Promise<AppUser> => {
    const response = await axios.put(`${baseApiUrl}/api/users/${id}`, dto);
    return response.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await axios.delete(`${baseApiUrl}/api/users/${id}`);
  },
};
