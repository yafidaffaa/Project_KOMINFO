import React, { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import AddUserModal from "../AddUserModal";
import DetailUserModal from "../DetailUserModal";
import {
  addUser,
  getUsersByRole,
  getUserByNik,
  editUser,
  deleteUser,
  type AddUserData,
  type User,
  type UserRole,
} from "../../../services/userService";

interface Props {
  role: UserRole;
}

const UserTable: React.FC<Props> = ({ role }) => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Load users by role
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      const data = await getUsersByRole(role);
      setUsers(data);
      setLoading(false);
    };
    loadUsers();
  }, [role]);

  const filteredUsers = users.filter(
    (u) =>
      u.nama.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  // Add user
  const handleAddUser = async (data: AddUserData) => {
    try {
      const newUser = await addUser(role, data);
      setUsers((prev) => [...prev, { ...newUser }]);
      setAddModalOpen(false);
    } catch (err: any) {
      alert("Gagal menambahkan user: " + (err.message || "Unknown error"));
    }
  };

  // Open detail & fetch full user
 const handleOpenDetail = async (user: User) => {
  console.log("✅ Detail button clicked:", user);
  setLoading(true);
  const fullUser = await getUserByNik(role, user.nik);
  console.log("✅ Full user fetched:", fullUser);
  setSelectedUser(fullUser);
  setDetailModalOpen(true);
  setLoading(false);
};

  // Edit user
  const handleEditUser = async (data: AddUserData) => {
    if (!selectedUser) return;
    try {
      const updatedUser = await editUser(role, selectedUser.nik, data);
      setUsers((prev) =>
        prev.map((u) => (u.nik === updatedUser.nik ? updatedUser : u))
      );
      setDetailModalOpen(false);
    } catch (err) {
      alert("Gagal edit user");
    }
  };

  // Delete user
  const handleDeleteUser = async (nik: string) => {
    try {
      await deleteUser(role, nik);
      setUsers((prev) => prev.filter((u) => u.nik !== nik));
      setDetailModalOpen(false);
    } catch (err) {
      alert("Gagal hapus user");
    }
  };

  return (
    <div className="pt-6 flex-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Daftar Akun {role}</h2>
        <div className="flex items-center gap-2">
          <button
            className="bg-black text-white p-2 rounded-full hover:bg-gray-800"
            onClick={() => setAddModalOpen(true)}
          >
            <Plus size={18} />
          </button>
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-lg pl-3 pr-10 py-1 text-sm"
            />
            <Search className="absolute right-2 top-1.5 h-4 w-4 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg">
        {loading ? (
          <p className="p-4 text-center">Loading...</p>
        ) : (
          <table className="w-full border-collapse bg-white rounded-lg">
            <thead className="bg-white">
              <tr>
                <th className="px-4 py-2 text-left">No</th>
                <th className="px-4 py-2 text-left">Nama</th>
                <th className="px-4 py-2 text-left">No Hp</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <tr key={user.nik} className="border-t">
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">{user.nama}</td>
                    <td className="px-4 py-2">{user.noHp}</td>
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2 text-center">
                      <button
                        className="bg-gray-700 text-white text-xs px-3 py-1 rounded-full hover:bg-gray-800"
                        onClick={() => handleOpenDetail(user)}
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-4 text-center text-gray-500"
                  >
                    Tidak ada data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      <AddUserModal
        open={addModalOpen}
        role={role}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleAddUser}
      />
      <DetailUserModal
        open={detailModalOpen}
        user={selectedUser}
        role={role}
        onClose={() => setDetailModalOpen(false)}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
      />
    </div>
  );
};

export default UserTable;
