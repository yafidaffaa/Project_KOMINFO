import React, { useState, useEffect } from "react";
import {
  createBugCategory,
  updateBugCategory,
  type BugCategory,
} from "../../services/BugCategoryServices";
import { getValidators, type User } from "../../services/userService"; // 👈 ambil dari userService

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // reload data setelah sukses
  mode: "create" | "edit";
  initialData?: BugCategory | null;
};

const BugCategoryFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  mode,
  initialData,
}) => {
  const [namaLayanan, setNamaLayanan] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [validator, setValidator] = useState("");
  const [validators, setValidators] = useState<User[]>([]); // 👈 state untuk dropdown

  // isi form kalau edit
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setNamaLayanan(initialData.nama_layanan);
      setDeskripsi(initialData.deskripsi);
      setValidator(initialData.nik_validator);
    } else {
      setNamaLayanan("");
      setDeskripsi("");
      setValidator("");
    }
  }, [isOpen, mode, initialData]);

  // load validator dari API
  useEffect(() => {
    if (isOpen) {
      getValidators()
        .then(setValidators)
        .catch((err) => console.error("Gagal fetch validator:", err));
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === "create") {
        await createBugCategory({
          nama_layanan: namaLayanan,
          deskripsi,
          nik_validator: validator,
        });
      } else if (mode === "edit" && initialData) {
        await updateBugCategory(initialData.id, {
          nama_layanan: namaLayanan,
          deskripsi,
          nik_validator: validator,
        });
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error saving kategori:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-[500px] shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-center">
          {mode === "create" ? "Tambah Kategori" : "Edit Kategori"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Kategori</label>
            <input
              type="text"
              value={namaLayanan}
              onChange={(e) => setNamaLayanan(e.target.value)}
              className="w-full border rounded-md px-3 py-2 mt-1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Deskripsi</label>
            <textarea
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              className="w-full border rounded-md px-3 py-2 mt-1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Validator</label>
            <select
              value={validator}
              onChange={(e) => setValidator(e.target.value)}
              className="w-full border rounded-md px-3 py-2 mt-1"
              required
            >
              <option value="">-- Pilih Validator --</option>
              {validators.map((v) => (
                <option key={v.nik} value={v.nik}>
                  {v.nama} ({v.nik})
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-center gap-3 pt-4">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-md"
            >
              Simpan
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-md"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BugCategoryFormModal;
