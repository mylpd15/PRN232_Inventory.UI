import axios from 'axios';

const baseApiUrl = import.meta.env.VITE_SERVER_URL;
const dashboardUrl = `${baseApiUrl}/api/dashboard`;

// Phù hợp với GET /api/dashboard/summary
export interface HomeSummary {
  totalSales: number;
  unitSold: number;
  outOfStock: number;
  compareLastWeek: {
    sales: number;
    units: number;
  };
}

// Phù hợp với GET /api/dashboard/sales-daily
export interface DailySales {
  day: string;   // Ví dụ: "Mon", "Tue"
  value: number; // Giá trị bán trong ngày
}

// Phù hợp với GET /api/dashboard/out-of-stock
export interface OutOfStockProduct {
  name: string;
  sku: string;
  price: number;
}

// Phù hợp với GET /api/dashboard/top-selling
export interface TopSellingProduct {
  name: string;
  sold: number;
  revenue: number;
}

export const HomeService = {
  getSummary: async (): Promise<HomeSummary> => {
    const res = await axios.get(`${dashboardUrl}/summary`);
    return res.data;
  },

  getSalesDaily: async (): Promise<DailySales[]> => {
    const res = await axios.get(`${dashboardUrl}/sales-daily`);
    return res.data;
  },

  getOutOfStock: async (limit = 3): Promise<OutOfStockProduct[]> => {
    const res = await axios.get(`${dashboardUrl}/out-of-stock?limit=${limit}`);
    return res.data;
  },

  getTopSelling: async (limit = 3): Promise<TopSellingProduct[]> => {
    const res = await axios.get(`${dashboardUrl}/top-selling?limit=${limit}`);
    return res.data;
  },
};
