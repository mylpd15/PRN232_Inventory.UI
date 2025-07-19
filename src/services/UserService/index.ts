import { AddUserDto, AppUser } from './../../interfaces/AppUser';
import axios from 'axios';

export const UserService = {
  getUsers: async (): Promise<AppUser[]> => {
    const response = await axios.get(
      `${import.meta.env.VITE_SERVER_URL}/api/users`
    );
    return response.data;
  },
  addUser: async (dto: AddUserDto): Promise<AppUser> => {
    const response = await axios.post(
      `${import.meta.env.VITE_SERVER_URL}/api/users`,
      dto
    );
    return response.data;
  },
  updateUser: async (id: string, dto: AddUserDto): Promise<AppUser> => {
    const response = await axios.put(
      `${import.meta.env.VITE_SERVER_URL}/api/users/${id}`,
      dto
    );
    return response.data;
  },
  deleteUser: async (id: string): Promise<void> => {
    await axios.delete(`${import.meta.env.VITE_SERVER_URL}/api/users/${id}`);
  },
};
