import React from 'react';
import MainLayout from '../../layouts/MainLayout';

export function Home() {
  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        {/* Overview cards */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow flex flex-col gap-2">
            <div className="text-gray-500">Total sales</div>
            <div className="text-2xl font-bold">$325,000.00</div>
            <div className="text-xs text-red-500">↓ 45% vs. last week</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow flex flex-col gap-2">
            <div className="text-gray-500">Unit sold</div>
            <div className="text-2xl font-bold">6,098</div>
            <div className="text-xs text-red-500">↓ 59% vs. last week</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow flex flex-col gap-2">
            <div className="text-gray-500">Out of stock</div>
            <div className="text-2xl font-bold text-red-600">300</div>
          </div>
        </div>

        {/* Sales chart + Out of stock list */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-white rounded-xl p-6 shadow">
            <div className="font-semibold mb-2">Sales</div>
            {/* Placeholder for chart */}
            <div className="h-40 flex items-end gap-2">
              {[400, 350, 500, 450, 480, 470, 420].map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div className="w-8 bg-yellow-400 rounded-t-lg" style={{ height: v / 2 }}></div>
                  <div className="text-xs mt-1 text-gray-500">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="font-semibold mb-2 flex justify-between items-center">Out of stock <a href="#" className="text-xs text-yellow-600">View all</a></div>
            <ul className="divide-y">
              {[
                { name: 'iPad 2022', sku: 'Read-4925-2-54', price: '$1230.00' },
                { name: 'LG T486', sku: 'Read-4923-2-53', price: '$710.00' },
                { name: 'HP 9403', sku: 'Read-4921-2-51', price: '$900.00' },
              ].map((item, i) => (
                <li key={i} className="py-2 flex justify-between text-sm">
                  <span>{item.name} <span className="text-gray-400 ml-2">{item.sku}</span></span>
                  <span className="font-semibold">{item.price}</span>
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
              {[
                { name: 'iPad 2022', sold: 1200, revenue: '$123,000' },
                { name: 'LG T486', sold: 900, revenue: '$71,000' },
                { name: 'HP 9403', sold: 800, revenue: '$90,000' },
              ].map((item, i) => (
                <tr key={i} className="border-t">
                  <td className="py-2 font-medium">{item.name}</td>
                  <td className="py-2">{item.sold}</td>
                  <td className="py-2">{item.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}