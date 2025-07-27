const API_BASE = `${import.meta.env.VITE_SERVER_URL}/odata/Deliveries`;
const DELIVERY_DETAILS_API = `${import.meta.env.VITE_SERVER_URL}/odata/DeliveryDetails`;

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

export interface CreateDeliveryPayload {
  SalesDate: string;
  CustomerID: number;
  deliveryDetails: {
    productID: number;
    deliveryQuantity: number;
    expectedDate: string;
  }[];
}

function getToken() {
  return localStorage.getItem('accessToken');
}

export async function getDeliveriesByCustomer(customerId: number | string) {
  const res = await fetch(`${API_BASE}?$filter=customerID eq ${customerId}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return res.json();
}

export async function getDeliveryById(deliveryId: number | string) {
  const res = await fetch(`${API_BASE}(${deliveryId})`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
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
    throw new Error(errorText || `Failed to fetch delivery: ${res.status}`);
  }
  return res.json();
}

export async function createDelivery(data: CreateDeliveryPayload) {
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

// Delivery Details APIs
export async function createDeliveryDetail(data: Omit<DeliveryDetail, 'deliveryDetailID'>) {
  const res = await fetch(DELIVERY_DETAILS_API, {
    method: 'POST',
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
    throw new Error(errorText || `Failed to add delivery detail: ${res.status}`);
  }
  return res.json();
}

export async function updateDeliveryDetail(deliveryDetailId: number | string, data: Partial<DeliveryDetail>) {
  const res = await fetch(`${DELIVERY_DETAILS_API}/${deliveryDetailId}`, {
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
    throw new Error(errorText || `Failed to update delivery detail: ${res.status}`);
  }
  if (res.status === 204) return;
  return res.json();
}

export async function deleteDeliveryDetail(deliveryDetailId: number | string) {
  const res = await fetch(`${DELIVERY_DETAILS_API}/${deliveryDetailId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
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
    throw new Error(errorText || `Failed to delete delivery detail: ${res.status}`);
  }
  return res.ok;
} 