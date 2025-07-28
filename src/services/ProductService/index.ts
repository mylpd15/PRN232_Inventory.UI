// src/services/ProductService/index.ts

const API_BASE = `${import.meta.env.VITE_SERVER_URL}/odata/Products`;

function getToken(): string | null {
  return localStorage.getItem('accessToken');
}

// Interface cho giá của product
export interface ProductPrice {
  ProductPriceId: number;
  ProductID: number;
  CostPrice: number;
  SellingPrice: number;
  EffectiveDate: string;
  IsActive: boolean;
}

// Interface cho product
export interface Product {
  ProductID: number;
  ProductCode: string;
  BarCode?: string;
  ProductName?: string;
  ProductDescription?: string;
  ProductCategory?: string;
  ReorderQuantity: number;
  PackedWeight: number;
  PackedHeight: number;
  PackedWidth: number;
  PackedDepth: number;
  Refrigerated: boolean;
  Prices?: ProductPrice[];
}

// Lấy danh sách product, hỗ trợ paging và expand navigation
export async function getProducts(
  top = 10,
  skip = 0,
  expand = 'Prices'
): Promise<Product[]> {
  const qs = `?$top=${top}&$skip=${skip}${expand ? `&$expand=${expand}` : ''}`;
  const res = await fetch(`${API_BASE}${qs}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  const body = await res.json();
  return body.value;
}

// Lấy chi tiết 1 product
export async function getProductById(
  productId: number | string,
  expand = 'Prices'
): Promise<Product> {
  const qs = expand ? `?$expand=${expand}` : '';
  const res = await fetch(`${API_BASE}(${productId})${qs}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  // Với OData, lại trả về object trực tiếp
  return await res.json();
}

// DTO cho create
export interface CreateProductWithPrice {
  Product: Omit<Product, 'ProductID' | 'Prices'>;
  ProductPrice: Omit<ProductPrice, 'ProductPriceId'>;
}

// POST tạo mới product kèm giá
export async function createProduct(data: CreateProductWithPrice): Promise<Product> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });
  return await res.json();
}

// DTO cho update
export interface UpdateProductWithPrice extends CreateProductWithPrice {
  Product: Product;
  ProductPrice: ProductPrice;
}

// PUT cập nhật product + price
export async function updateProduct(
  productId: number | string,
  data: UpdateProductWithPrice
): Promise<void> {
  const res = await fetch(`${API_BASE}/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok && res.status !== 204) {
    const text = await res.text();
    throw new Error(`Update failed (${res.status}): ${text}`);
  }
}

// DELETE
export async function deleteProduct(productId: number | string): Promise<boolean> {
  const res = await fetch(`${API_BASE}(${productId})`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return res.ok;
}
