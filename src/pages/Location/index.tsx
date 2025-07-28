import React, { useEffect, useState } from 'react';
import { Pencil, Trash, Plus } from 'lucide-react';
import MainLayout from '../../layouts/MainLayout';
import {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
} from '../../services/LocationService';
import { Locations } from '../../interfaces';
import { toast } from 'react-hot-toast';

const LocationPage: React.FC = () => {
  const [locations, setLocations] = useState<Locations[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Locations>({
    LocationName: '',
    LocationAddress: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // Paging + Search
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const fetchData = async () => {
  setLoading(true);
  try {
    const escaped = searchText.replace(/'/g, "''"); // escape '
    const result = await getLocations({
      search: escaped,
      top: pageSize,
      skip: page * pageSize,
    });

    setLocations(result.value || []);
    setTotalCount(result['@odata.count'] || 0);
  } catch {
    toast.error('Failed to load locations');
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchData();
  }, [page, pageSize, searchText]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateLocation(editId, formData);
        toast.success('Location updated');
      } else {
        await createLocation(formData);
        toast.success('Location created');
      }
      fetchData();
      setShowModal(false);
      setFormData({ LocationName: '', LocationAddress: '' });
      setEditId(null);
    } catch {
      toast.error('Error saving location');
    }
  };

  const handleEdit = (loc: Locations) => {
    setFormData({
      LocationName: loc.LocationName,
      LocationAddress: loc.LocationAddress || '',
    });
    setEditId(loc.LocationID || null);
    setShowModal(true);
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (confirm('Are you sure you want to delete this location?')) {
      try {
        await deleteLocation(id);
        toast.success('Location deleted');
        fetchData();
      } catch {
        toast.error('Error deleting location');
      }
    }
  };

  return (
    <MainLayout>
      <div className="p-6 bg-white rounded-xl shadow-md w-full max-w-5xl mx-auto">
        <h2 className="text-xl font-semibold mb-6">Location Management</h2>

        <div className="flex justify-between mb-4 items-center gap-4">
          <input
            type="text"
            placeholder="Search by name..."
            className="border px-3 py-2 rounded-2xl max-w-md w-full"
            value={searchText}
            onChange={(e) => {
              setPage(0); // reset to first page when searching
              setSearchText(e.target.value);
            }}
          />
          <button
            className="bg-yellow-600 text-white px-4 py-2 rounded-2xl hover:bg-yellow-700 flex items-center gap-1"
            onClick={() => {
              setFormData({ LocationName: '', LocationAddress: '' });
              setEditId(null);
              setShowModal(true);
            }}
          >
            <Plus size={16} /> Add Location
          </button>
        </div>

        {loading ? (
          <div className="text-center py-6">Loading locations...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-2">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 text-sm">
                    <th className="px-3">ID</th>
                    <th className="px-3">Name</th>
                    <th className="px-3">Address</th>
                    <th className="px-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {locations.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-6 text-gray-500">
                        No locations found.
                      </td>
                    </tr>
                  ) : (
                    locations.map((loc) => (
                      <tr
                        key={loc.LocationID}
                        className="bg-white hover:bg-gray-50 rounded shadow-sm"
                      >
                        <td className="px-3 py-2">{loc.LocationID}</td>
                        <td className="px-3">{loc.LocationName}</td>
                        <td className="px-3">{loc.LocationAddress}</td>
                        <td className="px-3 flex items-center gap-3 py-2">
                          <Pencil
                            size={16}
                            className="text-blue-600 cursor-pointer hover:text-blue-800"
                            onClick={() => handleEdit(loc)}
                          />
                          <Trash
                            size={16}
                            className="text-red-600 cursor-pointer hover:text-red-800"
                            onClick={() => handleDelete(loc.LocationID)}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Paging */}
            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                disabled={page === 0}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span>
                Page {page + 1} / {Math.ceil(totalCount / pageSize)}
              </span>
              <button
                onClick={() => setPage((prev) => prev + 1)}
                disabled={(page + 1) * pageSize >= totalCount}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>

            <select
              className="border px-3 py-2 w-[140px] rounded-2xl mt-5"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(0);
              }}
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">
                {editId ? 'Edit Location' : 'Add Location'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block mb-1">Name</label>
                  <input
                    className="w-full border px-3 py-2 rounded"
                    name="LocationName"
                    value={formData.LocationName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1">Address (optional)</label>
                  <input
                    className="w-full border px-3 py-2 rounded"
                    name="LocationAddress"
                    value={formData.LocationAddress}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="mr-2 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-yellow-500 text-white hover:bg-yellow-600"
                  >
                    Save
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

export default LocationPage;
