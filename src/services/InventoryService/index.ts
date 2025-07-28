// src/services/InventoryService/index.ts

const API_BASE = `${import.meta.env.VITE_SERVER_URL}/odata/Inventories`;
function getToken(): string | null {
  return localStorage.getItem('accessToken');
}

export interface InventoryLog {
  LogID: number;
  InventoryID: number;
  ActionType: string;
  ChangedQuantity: number;
  Description?: string;
  CreatedAt: string;
  UpdatedAt?: string;
}

export interface Inventory {
  InventoryID?: number;
  QuantityAvailable: number;
  MinimumStockLevel: number;
  MaximumStockLevel: number;
  ReorderPoint: number;
  ProductID: number;
  ProductName?: string;
  WarehouseID: number;
  WarehouseName?: string;
  InventoryLogs?: InventoryLog[];
}

// GET danh sách, có thể truyền top, skip, và expand navigation
export async function getInventories(
  top = 10,
  skip = 0,
  expand = 'InventoryLogs'
): Promise<Inventory[]> {
  const qs = `?$top=${top}&$skip=${skip}${expand ? `&$expand=${expand}` : ''}`;
  const res = await fetch(`${API_BASE}${qs}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  const body = await res.json();
  return body.value;
}

// GET chi tiết 1 bản ghi
export async function getInventoryById(
  inventoryId: number | string,
  expand = 'InventoryLogs'
): Promise<Inventory> {
  const qs = expand ? `?$expand=${expand}` : '';
  const res = await fetch(`${API_BASE}(${inventoryId})${qs}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  const body = await res.json();
  return body;
}

// POST Tạo mới
export async function createInventory(data: Inventory): Promise<Inventory> {
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

// PUT Cập nhật
export async function updateInventory(
  inventoryId: number | string,
  data: Omit<Inventory, 'InventoryID'>
): Promise<void> {
  // build a payload that includes the InventoryID field
  const payload = { ...data, InventoryID: Number(inventoryId) };

  const res = await fetch(`${API_BASE}/${inventoryId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok && res.status !== 204) {
    const text = await res.text();
    console.error('UpdateInventory failed:', res.status, text);
    throw new Error(`Update failed (${res.status}): ${text}`);
  }
}


// DELETE
export async function deleteInventory(
  inventoryId: number | string
): Promise<boolean> {
  const res = await fetch(`${API_BASE}(${inventoryId})`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return res.ok;
}
