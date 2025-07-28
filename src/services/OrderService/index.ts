const API_BASE = `${import.meta.env.VITE_SERVER_URL}/odata/Orders`;
const API_ORDERS = `${import.meta.env.VITE_SERVER_URL}/api/Orders`; // For status updates
const PROVIDERS_API = `${import.meta.env.VITE_SERVER_URL}/odata/Providers`;
const WAREHOUSES_API = `${import.meta.env.VITE_SERVER_URL}/odata/Warehouses`;
const PRODUCTS_API = `${import.meta.env.VITE_SERVER_URL}/odata/Products`;

function getToken() {
  return localStorage.getItem('accessToken');
}

export interface CreateOrderDetailDto {
  productID: number;
  orderQuantity: number;
  expectedDate: string;
}

export interface CreateOrderDto {
  orderDate: string;
  providerID: number;
  warehouseId: number;
  orderDetails: CreateOrderDetailDto[];
}

export interface UpdateOrderDto {
  OrderID: number;
  OrderDate: string;
  ProviderID: number;
  WarehouseId: number;
  OrderDetails: {
    ProductID: number;
    OrderQuantity: number;
    ExpectedDate: string;
  }[];
}


export async function createOrder(orderData: CreateOrderDto) {
  const res = await fetch(`${API_BASE}?$expand=Provider,Warehouse`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(orderData),
  });
  if (!res.ok) {
    const errorText = await res.text();
    let errorMsg = errorText;
    try {
      const errorJson = JSON.parse(errorText);
      errorMsg = errorJson.message || errorMsg;
    } catch {
      // Ignore JSON parse errors, use original error text
    }
    throw new Error(errorMsg || `Failed to create order: ${res.status}`);
  }
  return res.json();
}

export async function getOrders() {
  const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/odata/Orders?$expand=Provider,Warehouse,OrderDetails`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch orders: ${res.status}`);
  }

  const data = await res.json();
  return Array.isArray(data.value) ? data.value : [];
}

export async function getOrderById(orderId: number) {
  const res = await fetch(`${API_BASE}(${orderId})?$expand=Provider,Warehouse,OrderDetails`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch order details: ${res.status}`);
  }
  return res.json();
}


export async function updateOrderStatus(
  orderId: number,
  status: string,
  rejectReason?: string
) {
  const res = await fetch(`${API_ORDERS}/${orderId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ status, rejectReason }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to update order status: ${errorText}`);
  }

  return res.json();
}

// Add deleteOrder
export const deleteOrder = async (orderId: number) => {
  const response = await fetch(`${API_BASE}(${orderId})`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error(`Failed to delete order with ID ${orderId}`);
};

export async function updateOrder(orderId: number, orderData: UpdateOrderDto) {
  const res = await fetch(`${API_BASE}(${orderId})`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(orderData),
  });

  if (!res.ok) {
    const errorText = await res.text();
    let errorMsg = errorText;
    try {
      const errorJson = JSON.parse(errorText);
      errorMsg = errorJson.message || errorMsg;
    } catch {
      // Ignore JSON parse errors, use original error text
    }
    throw new Error(errorMsg || `Failed to update order: ${res.status}`);
  }
  return res.json();
}



export async function getProviders() {
  const res = await fetch(PROVIDERS_API, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  const data = await res.json();
  return Array.isArray(data.value) ? data.value : [];
}

export async function getWarehouses() {
  const res = await fetch(WAREHOUSES_API, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  const data = await res.json();
  return Array.isArray(data.value) ? data.value : [];
}

export async function getProducts() {
  const res = await fetch(`${PRODUCTS_API}?$expand=Prices`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  const data = await res.json();
  return Array.isArray(data.value) ? data.value : [];
}


 