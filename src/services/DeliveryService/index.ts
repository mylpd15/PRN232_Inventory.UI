const API_BASE = 'https://localhost:7136/odata/Deliveries';

export interface DeliveryDetail {
  deliveryDetailID: number;
  deliveryID: number;
  productID: number;
  deliveryQuantity: number;
  expectedDate: string;
  actualDate?: string;
  // Add more fields as needed
}

export interface Delivery {
  DeliveryID?: number;
  SalesDate: string;
  CustomerID: number;
  Status?: string | number;
  CreatedBy?: string;
  CreatedDate?: string;
  UpdatedBy?: string;
  UpdatedDate?: string;
  deliveryDetails?: DeliveryDetail[];
}

function getToken() {
  return localStorage.getItem('token');
}

export async function getDeliveriesByCustomer(customerId: number | string) {
  const res = await fetch(`${API_BASE}?$filter=customerID eq ${customerId}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return res.json();
}

export async function createDelivery(data: Omit<Delivery, 'DeliveryID'>) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorText = await res.text();
    const errorJson = JSON.parse(errorText);
    throw new Error(errorJson.message || `Failed to add delivery: ${res.status}`);
  }
  return res.json();
}

export async function updateDelivery(deliveryId: number | string, data: Partial<Delivery>) {
  const res = await fetch(`${API_BASE}/${deliveryId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorText = await res.text();
    try {
      const errorJson = JSON.parse(errorText);
      if (errorJson && errorJson.message) {
        throw new Error(errorJson.message);
      }
    } catch {
      // Not JSON, fall through
    }
    throw new Error(errorText || `Failed to update delivery: ${res.status}`);
  }
  if (res.status === 204) return;
  return res.json();
}

export async function deleteDelivery(deliveryId: number | string) {
  const res = await fetch(`${API_BASE}/${deliveryId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return res.ok;
} 