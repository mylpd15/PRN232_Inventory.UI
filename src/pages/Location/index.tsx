// import React, { useEffect, useState } from 'react';
// import {
//   getLocations,
//   createLocation,
//   updateLocation,
//   deleteLocation,
// } from '../../services/LocationService';
// import { AddLocationDto, Locations } from '../../interfaces';

// const LocationPage: React.FC = () => {
//   const [locations, setLocations] = useState<Locations[]>([]);
//   const [formData, setFormData] = useState<Locations>({
//     LocationName: '',
//     LocationAddress: '',
//   });
//   const [isEditing, setIsEditing] = useState(false);
//   const [editingId, setEditingId] = useState<number | null>(null);

//   const fetchData = async () => {
//     const result = await getLocations(100);
//     setLocations(result.value); // OData trả về { value: [...] }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (isEditing && editingId !== null) {
//       await updateLocation(editingId, formData);
//     } else {
//       await createLocation(formData);
//     }
//     setFormData({ locationName: '', locationAddress: '' });
//     setIsEditing(false);
//     setEditingId(null);
//     fetchData();
//   };

//   const handleEdit = (location: Location) => {
//     setFormData({
//       locationName: location.locationName,
//       locationAddress: location.locationAddress || '',
//     });
//     setIsEditing(true);
//     setEditingId(location.locationID || null);
//   };

//   const handleDelete = async (id: number | undefined) => {
//     if (id && confirm('Bạn chắc chắn muốn xóa?')) {
//       await deleteLocation(id);
//       fetchData();
//     }
//   };

//   return (
//     <div className="container">
//       <h2 className="text-xl font-bold mb-4">Quản lý Địa điểm (Locations)</h2>

//       <form onSubmit={handleSubmit} className="space-y-2">
//         <input
//           name="locationName"
//           placeholder="Tên địa điểm"
//           value={formData.locationName}
//           onChange={handleChange}
//           className="border p-2 w-full"
//           required
//         />
//         <input
//           name="locationAddress"
//           placeholder="Địa chỉ (tùy chọn)"
//           value={formData.locationAddress}
//           onChange={handleChange}
//           className="border p-2 w-full"
//         />
//         <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
//           {isEditing ? 'Cập nhật' : 'Thêm mới'}
//         </button>
//       </form>

//       <table className="table-auto border-collapse w-full mt-6">
//         <thead>
//           <tr className="bg-gray-200">
//             <th className="border px-4 py-2">ID</th>
//             <th className="border px-4 py-2">Tên</th>
//             <th className="border px-4 py-2">Địa chỉ</th>
//             <th className="border px-4 py-2">Thao tác</th>
//           </tr>
//         </thead>
//         <tbody>
//           {locations.map((loc) => (
//             <tr key={loc.locationID}>
//               <td className="border px-4 py-2">{loc.locationID}</td>
//               <td className="border px-4 py-2">{loc.locationName}</td>
//               <td className="border px-4 py-2">{loc.locationAddress}</td>
//               <td className="border px-4 py-2 space-x-2">
//                 <button
//                   onClick={() => handleEdit(loc)}
//                   className="bg-yellow-400 text-white px-2 py-1 rounded"
//                 >
//                   Sửa
//                 </button>
//                 <button
//                   onClick={() => handleDelete(loc.locationID)}
//                   className="bg-red-500 text-white px-2 py-1 rounded"
//                 >
//                   Xóa
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default LocationPage;
