import { Warehouse } from "../../interfaces";

const API_BASE = `${import.meta.env.VITE_SERVER_URL}/odata/Warehouses`;
function getToken() {
  return localStorage.getItem('accessToken');
}

export async function getWarehouses({
  search = "",
  skip = 0,
  top = 5,
}: {
  search?: string;
  skip?: number;
  top?: number;
}) {
  let url = `${API_BASE}?$count=true&$skip=${skip}&$top=${top}`;

  if (search) {
    url += `&$filter=contains(tolower(warehouseName), '${search.toLowerCase()}')`;
  }

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch warehouses");

  const data = await res.json();
  return data;
}



export async function createWarehouse(data: Warehouse) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateWarehouse(warehouseID: number | string, data: Warehouse) {
  const res = await fetch(`${API_BASE}/${warehouseID}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });
  console.log(res);
  if(res.status === 204) return;
  return res.json();
}

export async function deleteWarehouse(warehouseId: number | string) {
  const res = await fetch(`${API_BASE}/${warehouseId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return res.ok;
} 