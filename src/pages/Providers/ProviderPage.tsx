import React, { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { getProviders, createProvider } from "../../services/ProviderService";
import { toast } from "react-hot-toast";
import { Pencil, Trash, View } from "lucide-react";

interface Provider {
  ProviderID: number;
  ProviderName: string;
  ProviderAddress?: string;
}

interface CreateProviderDto {
  ProviderName: string;
  ProviderAddress?: string;
}

const ProviderPage: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<CreateProviderDto>({
    ProviderName: "",
    ProviderAddress: "",
  });

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const data = await getProviders();
      setProviders(data);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Không thể tải danh sách nhà cung cấp";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredProviders = providers.filter((p) =>
    p.ProviderName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = () => {
    setForm({ ProviderName: "", ProviderAddress: "" });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProvider(form);
      toast.success("Thêm nhà cung cấp thành công!");
      setShowModal(false);
      fetchProviders();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi thêm nhà cung cấp.";
      toast.error(message);
    }
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-full mx-auto">
        <h2 className="text-2xl font-bold mb-4">Quản lý Nhà Cung Cấp</h2>
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên nhà cung cấp..."
            className="border rounded px-3 py-2 w-1/2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={handleOpenModal}
          >
            Thêm Nhà Cung Cấp
          </button>
        </div>

        {loading ? (
          <p>Đang tải danh sách...</p>
        ) : filteredProviders.length === 0 ? (
          <p>Không có nhà cung cấp nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="py-3 px-4 text-left">ID</th>
                  <th className="py-3 px-4 text-left">Tên Nhà Cung Cấp</th>
                  <th className="py-3 px-4 text-left">Địa chỉ</th>
                  {/* Future action buttons can be added here */}
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {filteredProviders.map((provider) => (
                  <tr
                    key={provider.ProviderID}
                    className="border-b border-gray-200 hover:bg-gray-100"
                  >
                    <td className="py-3 px-4">{provider.ProviderID}</td>
                    <td className="py-3 px-4">{provider.ProviderName}</td>
                    <td className="py-3 px-4">
                      {provider.ProviderAddress || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Thêm Nhà Cung Cấp</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block mb-1">Tên Nhà Cung Cấp</label>
                  <input
                    className="w-full border px-3 py-2 rounded"
                    name="ProviderName"
                    value={form.ProviderName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1">Địa Chỉ</label>
                  <input
                    className="w-full border px-3 py-2 rounded"
                    name="ProviderAddress"
                    value={form.ProviderAddress}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="mr-2 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                    onClick={handleCloseModal}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Lưu
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ProviderPage;
