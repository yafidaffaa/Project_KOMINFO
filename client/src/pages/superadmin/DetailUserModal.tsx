import React, { useState } from "react";
import { X, Edit3, Trash2 } from "lucide-react";
import type { User, UserRole, AddUserData } from "../../services/userService";

interface Props {
  open: boolean;
  user: User | null;
  role: UserRole;
  onClose: () => void;
  onEdit: (data: AddUserData) => void;
  onDelete: (id: string) => void;
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin_sa: "Admin SA",
  admin_kategori: "Admin Kategori",
  pencatat: "Pencatat",
  validator: "Validator",
  user_umum: "Masyarakat",
  teknisi: "Teknisi",
};

const DetailUserModal: React.FC<Props> = ({
  open,
  user,
  role,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<Partial<AddUserData>>({});

  if (!open || !user) return null;

  const handleEditClick = () => {
    setForm({
      nama: user.nama,
      email: user.email,
      username: user.username,
      no_hp: user.noHp,
      nik: user.nik,
    });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    onEdit(form as AddUserData);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setForm({});
  };

  const handleDelete = () => {
    if (window.confirm(`Hapus user ${user.nama}?`)) {
      onDelete(user.nik);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  if (isEditing) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-md mx-auto shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">
              Edit {ROLE_LABELS[role]}
            </h2>
            <button
              onClick={handleCancelEdit}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={form.username || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Nama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama
              </label>
              <input
                type="text"
                name="nama"
                value={form.nama || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* No HP (optional) */}
            {role !== "user_umum" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  No HP
                </label>
                <input
                  type="text"
                  name="no_hp"
                  value={form.no_hp || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 p-6 border-t border-gray-100">
            <button
              onClick={handleCancelEdit}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Batal
            </button>
            <button
              onClick={handleSaveEdit}
              className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Detail Mode
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md mx-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">
            Detail Akun {ROLE_LABELS[role]}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <span className="text-sm font-medium text-gray-500">Nama</span>
                <p className="text-gray-900 font-medium">{user.nama}</p>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-500">Email</span>
                <p className="text-gray-900 font-medium break-all">
                  {user.email}
                </p>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-500">
                  Username
                </span>
                <p className="text-gray-900 font-medium">{user.username}</p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <span className="text-sm font-medium text-gray-500">NIK</span>
                <p className="text-gray-900 font-medium">{user.nik}</p>
              </div>

              {user.noHp && user.noHp !== "-" && (
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    No HP
                  </span>
                  <p className="text-gray-900 font-medium">{user.noHp}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-100">
          <button
            onClick={handleEditClick}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-white bg-yellow-500 rounded-xl hover:bg-yellow-600 transition-colors font-medium"
          >
            <Edit3 className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors font-medium"
          >
            <Trash2 className="w-4 h-4" />
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailUserModal;
