import React, { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import {
  getProviders,
  getWarehouses,
  getProducts,
  createOrder,
} from "../../services/OrderService";
import { toast } from "react-hot-toast";

interface OrderDetailForm {
  productID: number;
  orderQuantity: number;
  expectedDate: string;
}

interface ProductPrice {
  ProductPriceId: number;
  CostPrice: number;
  SellingPrice: number;
  IsActive: boolean;
}

interface Product {
  ProductID: number;
  ProductName: string;
  Prices: ProductPrice[];
}

const CreateOrderPage: React.FC = () => {
  const [providers, setProviders] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [orderDate, setOrderDate] = useState("");
  const [providerID, setProviderID] = useState<number>(0);
  const [warehouseID, setWarehouseID] = useState<number>(0);
  const [orderDetails, setOrderDetails] = useState<OrderDetailForm[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [prov, ware, prod] = await Promise.all([
          getProviders(),
          getWarehouses(),
          getProducts(),
        ]);
        setProviders(prov);
        setWarehouses(ware);
        setProducts(prod);
        setProviderID(prov[0]?.ProviderID || 0);
        setWarehouseID(ware[0]?.WarehouseID || 0);
        setOrderDetails([
          {
            productID: prod[0]?.ProductID || 0,
            orderQuantity: 1,
            expectedDate: "",
          },
        ]);
      } catch (err) {
        toast.error("Không thể tải dữ liệu dropdown");
      }
    }
    fetchData();
  }, []);

  const handleDetailChange = (
    idx: number,
    field: keyof OrderDetailForm,
    value: any
  ) => {
    setOrderDetails((details) =>
      details.map((d, i) => (i === idx ? { ...d, [field]: value } : d))
    );
  };

  const handleAddDetail = () => {
    setOrderDetails((details) => [
      ...details,
      {
        productID: products[0]?.ProductID || 0,
        orderQuantity: 1,
        expectedDate: "",
      },
    ]);
  };

  const handleRemoveDetail = (idx: number) => {
    setOrderDetails((details) => details.filter((_, i) => i !== idx));
  };

  const calculateLineCost = (productID: number, quantity: number) => {
    const product = products.find((p) => p.ProductID === productID);
    const activePrice = product?.Prices.find((price) => price.IsActive);
    return (activePrice?.CostPrice ?? 0) * quantity;
  };

  const calculateTotalAmount = () => {
    return orderDetails.reduce((total, detail) => {
      return total + calculateLineCost(detail.productID, detail.orderQuantity);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createOrder({
        orderDate,
        providerID,
        warehouseId: warehouseID,
        orderDetails: orderDetails.map((d) => ({
          productID: d.productID,
          orderQuantity: d.orderQuantity,
          expectedDate: d.expectedDate,
        })),
      });
      toast.success("Tạo Order thành công!");
    } catch (err: any) {
      toast.error(err?.message || "Tạo Order thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Tạo Order mới</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Ngày đặt hàng</label>
            <input
              type="date"
              className="border rounded px-2 py-1 w-full"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Nhà cung cấp</label>
            <select
              className="border rounded px-2 py-1 w-full"
              value={providerID}
              onChange={(e) => setProviderID(Number(e.target.value))}
              required
            >
              {providers.map((p) => (
                <option key={p.ProviderID} value={p.ProviderID}>
                  {p.ProviderName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Kho nhập</label>
            <select
              className="border rounded px-2 py-1 w-full"
              value={warehouseID}
              onChange={(e) => setWarehouseID(Number(e.target.value))}
              required
            >
              {warehouses.map((w) => (
                <option key={w.WarehouseID} value={w.WarehouseID}>
                  {w.WarehouseName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Chi tiết đơn hàng</label>
            {orderDetails.map((detail, idx) => {
              const lineCost = calculateLineCost(
                detail.productID,
                detail.orderQuantity
              );
              return (
                <div key={idx} className="flex gap-2 mb-2 items-center">
                  <select
                    className="border rounded px-2 py-1"
                    value={detail.productID}
                    onChange={(e) =>
                      handleDetailChange(
                        idx,
                        "productID",
                        Number(e.target.value)
                      )
                    }
                    required
                  >
                    {products.map((p) => (
                      <option key={p.ProductID} value={p.ProductID}>
                        {p.ProductName}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    className="border rounded px-2 py-1 w-20"
                    value={detail.orderQuantity}
                    onChange={(e) =>
                      handleDetailChange(
                        idx,
                        "orderQuantity",
                        Number(e.target.value)
                      )
                    }
                    required
                  />
                  <input
                    type="date"
                    className="border rounded px-2 py-1"
                    value={detail.expectedDate}
                    onChange={(e) =>
                      handleDetailChange(idx, "expectedDate", e.target.value)
                    }
                    required
                  />
                  <span className="ml-2 text-gray-600">
                    {lineCost.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </span>
                  <button
                    type="button"
                    className="text-red-500"
                    onClick={() => handleRemoveDetail(idx)}
                    disabled={orderDetails.length === 1}
                  >
                    X
                  </button>
                </div>
              );
            })}
            <button
              type="button"
              className="text-blue-500"
              onClick={handleAddDetail}
            >
              + Thêm sản phẩm
            </button>
          </div>

          {/* Total Amount */}
          <div className="font-semibold text-right text-lg">
            Tổng tiền:{" "}
            {calculateTotalAmount().toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })}
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? "Đang tạo..." : "Tạo Order"}
          </button>
        </form>
      </div>
    </MainLayout>
  );
};

export default CreateOrderPage;
