import { useEffect, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { HomeService, HomeSummary, DailySales, OutOfStockProduct, TopSellingProduct } from '../../services/DashboardService';

export function Home() {
  const [summary, setSummary] = useState<HomeSummary | null>(null);
  const [sales, setSales] = useState<DailySales[]>([]);
  const [outOfStock, setOutOfStock] = useState<OutOfStockProduct[]>([]);
  const [topSelling, setTopSelling] = useState<TopSellingProduct[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [s, sd, oos, ts] = await Promise.all([
        HomeService.getSummary(),
        HomeService.getSalesDaily(),
        HomeService.getOutOfStock(),
        HomeService.getTopSelling()
      ]);

      setSummary(s);
      setSales(sd);
      setOutOfStock(oos);
      setTopSelling(ts);
    };

    fetchData();
  }, []);

  const maxSalesValue = Math.max(...sales.map(s => s.value), 1);
  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        {/* Overview cards */}
        <div className="grid grid-cols-3 gap-6">
          {/* Total Sales */}
          <div className="bg-white rounded-xl p-6 shadow flex flex-col gap-2">
            <div className="text-gray-500">Total sales</div>
            <div className="text-2xl font-bold">
              {summary ? `$${summary.totalSales.toLocaleString()}.00` : '...'}
            </div>
            {summary && (
              <div
                className={`text-xs ${summary.compareLastWeek.sales >= 0 ? 'text-green-500' : 'text-red-500'}`}
              >
                {summary.compareLastWeek.sales >= 0 ? '↑' : '↓'} {Math.abs(summary.compareLastWeek.sales)}% vs. last week
              </div>
            )}
          </div>

          {/* Unit Sold */}
          <div className="bg-white rounded-xl p-6 shadow flex flex-col gap-2">
            <div className="text-gray-500">Unit sold</div>
            <div className="text-2xl font-bold">
              {summary ? summary.unitSold.toLocaleString() : '...'}
            </div>
            {summary && (
              <div
                className={`text-xs ${summary.compareLastWeek.units >= 0 ? 'text-green-500' : 'text-red-500'}`}
              >
                {summary.compareLastWeek.units >= 0 ? '↑' : '↓'} {Math.abs(summary.compareLastWeek.units)}% vs. last week
              </div>
            )}
          </div>

          {/* Out of Stock */}
          <div className="bg-white rounded-xl p-6 shadow flex flex-col gap-2">
            <div className="text-gray-500">Out of stock</div>
            <div className="text-2xl font-bold text-red-600">
              {summary ? summary.outOfStock : '...'}
            </div>
          </div>
        </div>

        {/* Sales chart + Out of stock list */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-white rounded-xl p-6 shadow">
            <div className="font-semibold mb-2">Sales</div>
            <div className="h-40 flex items-end gap-2">
              {sales.map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-8 bg-yellow-400 rounded-t-lg transition-all relative group"
                    style={{
                      height: `${(item.value / maxSalesValue) * 150}px`,
                      minHeight: '4px'
                    }}
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform bg-black text-white text-xs rounded px-2 py-1 pointer-events-none">
                      ${item.value}
                    </div>
                  </div>
                  <div className="text-xs mt-1 text-gray-500">{item.day}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow">
            <div className="font-semibold mb-2 flex justify-between items-center">
              Out of stock <a href="#" className="text-xs text-yellow-600">View all</a>
            </div>
            <ul className="divide-y">
              {outOfStock.map((item, i) => (
                <li key={i} className="py-2 flex justify-between text-sm">
                  <span>{item.name} <span className="text-gray-400 ml-2">{item.sku}</span></span>
                  <span className="font-semibold">${item.price.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Top selling products */}
        <div className="bg-white rounded-xl p-6 shadow mt-4">
          <div className="font-semibold mb-2">Top selling products</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-left">
                <th className="py-2">Product name</th>
                <th className="py-2">Unit sold</th>
                <th className="py-2">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topSelling.map((item, i) => (
                <tr key={i} className="border-t">
                  <td className="py-2 font-medium">{item.name}</td>
                  <td className="py-2">{item.sold.toLocaleString()}</td>
                  <td className="py-2">${item.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
