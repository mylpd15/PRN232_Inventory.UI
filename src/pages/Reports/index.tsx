import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import MainLayout from '../../layouts/MainLayout';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const API_URL = `${import.meta.env.VITE_SERVER_URL}/api/reports/transactions`;

const colorMap: Record<string, string> = {
  in: 'text-green-600',
  out: 'text-red-600',
};

function formatDate(date: Date | string) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Invalid date";
  return d.toISOString().slice(0, 10);
}
type Transaction = {
  date: string;
  product: string;
  productCode: string;
  quantity: number;
  type: 'in' | 'out';
  color: string;
  warehouse: string;
  partner: string;
};

const ReportsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [from, setFrom] = useState<string>(formatDate(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)));
  const [to, setTo] = useState<string>(formatDate(new Date()));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [from, to]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL, { params: { from, to } });
      setTransactions(res.data);
    } catch (e) {
      setTransactions([]);
    }
    setLoading(false);
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(transactions);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buf], { type: 'application/octet-stream' });
    saveAs(blob, 'transactions.xlsx');
  };

  // Chart data
  const chartData = React.useMemo(() => {
    // Group by date and type
    const map: Record<string, { in: number; out: number }> = {};
    transactions.forEach((t) => {
      const day = formatDate(t.date);
      if (!map[day]) map[day] = { in: 0, out: 0 };
      map[day][t.type] += t.quantity;
    });
    const labels = Object.keys(map).sort();
    return {
      labels,
      datasets: [
        {
          label: 'In (Import)',
          data: labels.map((d) => map[d].in),
          borderColor: 'green',
          backgroundColor: 'rgba(34,197,94,0.2)',
        },
        {
          label: 'Out (Export)',
          data: labels.map((d) => map[d].out),
          borderColor: 'red',
          backgroundColor: 'rgba(239,68,68,0.2)',
        },
      ],
    };
  }, [transactions]);

  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Transaction Reports</h1>
        <div className="flex gap-4 mb-4 items-end">
          <div>
            <label className="block text-sm font-medium">From</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="border rounded px-2 py-1" />
          </div>
          <div>
            <label className="block text-sm font-medium">To</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} className="border rounded px-2 py-1" />
          </div>
          <button onClick={handleExport} className="ml-auto bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded">Export to Excel</button>
        </div>
        <div className="mb-8">
          <Line data={chartData} options={{ responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'In/Out Transactions Over Time' } } }} />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-1 border">Date</th>
                <th className="px-2 py-1 border">Type</th>
                <th className="px-2 py-1 border">Product</th>
                <th className="px-2 py-1 border">Product Code</th>
                <th className="px-2 py-1 border">Quantity</th>
                <th className="px-2 py-1 border">Warehouse</th>
                <th className="px-2 py-1 border">Partner</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-4">Loading...</td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-4">No data</td></tr>
              ) : (
                transactions.map((t, idx) => (
                  <tr key={idx}>
                    <td className="border px-2 py-1">{formatDate(t.date)}</td>
                    <td className={`border px-2 py-1 font-bold ${colorMap[t.type]}`}>{t.type === 'in' ? 'In (Import)' : 'Out (Export)'}</td>
                    <td className="border px-2 py-1">{t.product}</td>
                    <td className="border px-2 py-1">{t.productCode}</td>
                    <td className="border px-2 py-1 text-right">{t.quantity}</td>
                    <td className="border px-2 py-1">{t.warehouse}</td>
                    <td className="border px-2 py-1">{t.partner}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>

  );
};

export default ReportsPage; 