// src/pages/products/index.tsx

import React, { useEffect, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    Product,
    CreateProductWithPrice,
} from '../../services/ProductService';
import { toast } from 'react-hot-toast';
import { Search, Edit, Trash, Plus } from 'lucide-react';

const defaultForm: CreateProductWithPrice = {
    Product: {
        ProductCode: '',
        BarCode: '',
        ProductName: '',
        ProductDescription: '',
        ProductCategory: '',
        ReorderQuantity: 0,
        PackedWeight: 0,
        PackedHeight: 0,
        PackedWidth: 0,
        PackedDepth: 0,
        Refrigerated: false,
    },
    ProductPrice: {
        ProductID: 0,
        CostPrice: 0,
        SellingPrice: 0,
        EffectiveDate: new Date().toISOString(),
        IsActive: true,
    },
};

export function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Product | null>(null);
    const [form, setForm] = useState<CreateProductWithPrice>(defaultForm);

    const [showModal, setShowModal] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // Fetch
    const load = async () => {
        setLoading(true);
        try {
            const data = await getProducts(100, 0);
            setProducts(data);
        } catch {
            toast.error('Cannot load products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    // Filtered list
    const filtered = products.filter(p =>
        p.ProductName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.ProductCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handlers
    const handleAdd = () => {
        setEditing(null);
        setForm(defaultForm);
        setShowModal(true);
    };

    const handleEdit = (product: Product) => {
        setEditing(product);
        const price = product.Prices?.[0]!;
        setForm({
            Product: { ...product },
            ProductPrice: price
                ? price
                : {
                    ProductID: product.ProductID,
                    CostPrice: 0,
                    SellingPrice: 0,
                    EffectiveDate: new Date().toISOString(),
                    IsActive: true,
                },
        });
        setShowModal(true);
    };

    const handleDelete = (id: number) => {
        setDeletingId(id);
        setShowDelete(true);
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editing) {
                await updateProduct(editing.ProductID, {
                    Product: { ...form.Product, ProductID: editing.ProductID },
                    ProductPrice: { ...form.ProductPrice, ProductPriceId: editing.Prices?.[0]?.ProductPriceId || 0 },
                });
                toast.success('Product updated');
            } else {
                await createProduct(form);
                toast.success('Product created');
            }
            setShowModal(false);
            load();
        } catch (err) {
            toast.error('Error saving product');
        }
    };

    const onConfirmDelete = async () => {
        if (deletingId == null) return;
        try {
            await deleteProduct(deletingId);
            toast.success('Product deleted');
            setShowDelete(false);
            load();
        } catch {
            toast.error('Failed to delete product');
        }
    };

    return (
        <MainLayout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Products</h1>
                <button
                    className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                    onClick={handleAdd}
                >
                    <Plus size={16} /> Add Product
                </button>
            </div>

            {/* Search box */}
            <div className="mb-4">
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Find by name or code..."
                        className="pl-10 pr-4 py-2 border rounded w-full"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">✕</button>
                    )}
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="text-center py-10">Loading…</div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-10">No products found</div>
            ) : (
                <table className="w-full border-collapse bg-white shadow rounded">
                    <thead>
                        <tr className="bg-gray-100">
                            {['Code', 'Name', 'Category', 'Sell Price', 'Actions'].map(h => (
                                <th key={h} className="border px-2 py-1 text-center">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(p => (
                            <tr key={p.ProductID} className="even:bg-gray-50">
                                {/* <td className="border px-2 py-1 text-center">{p.ProductID}</td> */}
                                <td className="border px-2 py-1 text-center">{p.ProductCode}</td>
                                <td className="border px-2 py-1 text-center">{p.ProductName}</td>
                                <td className="border px-2 py-1 text-center">{p.ProductCategory}</td>
                                <td className="border px-2 py-1 text-right">
                                    {p.Prices?.[0]?.SellingPrice != null
                                        ? p.Prices[0].SellingPrice.toLocaleString()
                                        : '–'}
                                </td>

                                <td className="border px-2 py-1 text-center">
                                    <button onClick={() => handleEdit(p)} className="mx-1 text-blue-600 hover:text-blue-800">
                                        <Edit size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(p.ProductID)} className="mx-1 text-red-600 hover:text-red-800">
                                        <Trash size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Modal Add/Edit */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow w-full max-w-lg">
                        <h2 className="text-xl font-bold mb-4">{editing ? 'Edit Product' : 'Add Product'}</h2>
                        <form onSubmit={onSubmit} className="space-y-4">
                            <div>
                                <label>Product Code</label>
                                <input type="text" value={form.Product.ProductCode}
                                    onChange={e => setForm({ ...form, Product: { ...form.Product, ProductCode: e.target.value } })}
                                    className="w-full border px-2 py-1 rounded" required />
                            </div>
                            <div>
                                <label>Product Name</label>
                                <input type="text" value={form.Product.ProductName || ''}
                                    onChange={e => setForm({ ...form, Product: { ...form.Product, ProductName: e.target.value } })}
                                    className="w-full border px-2 py-1 rounded" required />
                            </div>
                            <div>
                                <label>Category</label>
                                <input type="text" value={form.Product.ProductCategory || ''}
                                    onChange={e => setForm({ ...form, Product: { ...form.Product, ProductCategory: e.target.value } })}
                                    className="w-full border px-2 py-1 rounded" />
                            </div>
                            <div>
                                <label>Cost Price</label>
                                <input type="number" value={form.ProductPrice.CostPrice}
                                    onChange={e => setForm({ ...form, ProductPrice: { ...form.ProductPrice, CostPrice: +e.target.value } })}
                                    className="w-full border px-2 py-1 rounded" required />
                            </div>
                            <div>
                                <label>Selling Price</label>
                                <input type="number" value={form.ProductPrice.SellingPrice}
                                    onChange={e => setForm({ ...form, ProductPrice: { ...form.ProductPrice, SellingPrice: +e.target.value } })}
                                    className="w-full border px-2 py-1 rounded" required />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-yellow-500 text-white rounded">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Delete */}
            {showDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow w-full max-w-sm">
                        <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
                        <p>Are you sure you want to delete this product?</p>
                        <div className="flex justify-end space-x-2 mt-4">
                            <button onClick={() => setShowDelete(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                            <button onClick={onConfirmDelete} className="px-4 py-2 bg-red-500 text-white rounded">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}

export default ProductsPage;
