const API_BASE = 'https://localhost:7136/odata/Customers';

function getToken() {
  return localStorage.getItem('token');
}

export async function getCustomers(top = 5) {
  const res = await fetch(`${API_BASE}?$top=${top}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  const data = await res.json();
  return data;
}

export interface Customer {
  CustomerID?: number;
  CustomerName: string;
  CustomerAddress: string;
  CreatedBy?: string | null;
  CreatedDate?: string;
  UpdatedBy?: string | null;
  UpdatedDate?: string;
}

export async function createCustomer(data: Customer) {
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

export async function updateCustomer(customerId: number | string, data: Customer) {
  const res = await fetch(`${API_BASE}/${customerId}`, {
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

export async function deleteCustomer(customerId: number | string) {
  const res = await fetch(`${API_BASE}/${customerId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return res.ok;
} 