import { Camera, Edit, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AuthService } from "../../../services";  // cập nhật đường dẫn đúng
import { AppUser } from "../../../interfaces";

export function UserProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<AppUser | null>();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await AuthService.getProfile();
        setProfile(data);
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen bg-[#ebedf5] flex justify-center items-center p-6 font-['Montserrat',sans-serif]">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-5xl p-8">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm text-gray-600 hover:text-yellow-600 mb-4 transition hover:cursor-pointer"
        >
          <ArrowLeft className="mr-2" size={18} />
          Back
        </button>

        <h2 className="text-xl font-semibold text-gray-700 mb-6">Profile</h2>

        <div className="flex flex-col md:flex-row items-start md:items-center">
          {/* Avatar */}
          <div className="relative mr-8 mb-6 md:mb-0">
            <img
              src="https://static.vecteezy.com/system/resources/previews/009/292/244/original/default-avatar-icon-of-social-media-user-vector.jpg"
              alt="Profile"
              className="w-80 h-80 rounded-xl object-cover bg-gray-200"
            />
            <button className="absolute top-2 left-2 bg-white p-1 rounded-full shadow text-black hover:cursor-pointer">
              <Camera size={20} />
            </button>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="mb-4">
              <p className="text-sm text-gray-500">Name:</p>
              <p className="text-lg font-medium text-gray-800">
                {profile?.displayName || "N/A"}
              </p>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-500">Username:</p>
              <p className="text-lg font-medium text-gray-800">
                {profile?.username || "N/A"}
              </p>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-500">Email:</p>
              <p className="text-lg font-medium text-gray-800">
                {profile?.email || "Not provided"}
              </p>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-500">Role:</p>
              <p className="text-lg font-medium text-gray-800">
                {profile?.userRole || "N/A"}
              </p>
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-5 mt-4">
              <button className="flex items-center gap-2 px-4 py-2 border border-yellow-500 text-yellow-600 rounded-lg hover:bg-yellow-50 transition hover:cursor-pointer">
                <Edit size={16} />
                Edit Profile
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-yellow-500 text-yellow-600 rounded-lg hover:bg-yellow-50 transition hover:cursor-pointer">
                <Edit size={16} />
                History
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
