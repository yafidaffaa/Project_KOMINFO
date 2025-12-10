import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { getValidators, type AddUserData, type User, type UserRole } from "../../services/userService";

interface Props {
  open: boolean;
  role: UserRole;
  onClose: () => void;
  onSubmit: (data: AddUserData) => void;
  validators?: { nik: string; nama: string }[];
}

const ROLE_FIELDS: Record<
  UserRole,
  { name: keyof AddUserData; placeholder: string; type?: string }[]
> = {
  masyarakat: [
    { name: "nama", placeholder: "Nama" },
    { name: "email", placeholder: "Email", type: "email" },
    { name: "username", placeholder: "Username" },
    { name: "password", placeholder: "Password", type: "password" },
    { name: "confirmPassword", placeholder: "Konfirmasi Password", type: "password" },
    { name: "nik", placeholder: "NIK" },
  ],
  admin: [
    { name: "nama", placeholder: "Nama" },
    { name: "email", placeholder: "Email", type: "email" },
    { name: "username", placeholder: "Username" },
    { name: "password", placeholder: "Password", type: "password" },
    { name: "alamat", placeholder: "Alamat" },
    { name: "no_hp", placeholder: "No HP" },
    { name: "nik", placeholder: "NIK" },
    { name: "nip", placeholder: "NIP" },
  ],
  pencatat: [
    { name: "nama", placeholder: "Nama" },
    { name: "email", placeholder: "Email", type: "email" },
    { name: "username", placeholder: "Username" },
    { name: "password", placeholder: "Password", type: "password" },
    { name: "alamat", placeholder: "Alamat" },
    { name: "no_hp", placeholder: "No HP" },
    { name: "nik", placeholder: "NIK" },
    { name: "nip", placeholder: "NIP" },
  ],
  validator: [
    { name: "nama", placeholder: "Nama" },
    { name: "email", placeholder: "Email", type: "email" },
    { name: "username", placeholder: "Username" },
    { name: "password", placeholder: "Password", type: "password" },
    { name: "alamat", placeholder: "Alamat" },
    { name: "no_hp", placeholder: "No HP" },
    { name: "nik", placeholder: "NIK" },
    { name: "nip", placeholder: "NIP" },
  ],
  teknisi: [
    { name: "nama", placeholder: "Nama" },
    { name: "email", placeholder: "Email", type: "email" },
    { name: "username", placeholder: "Username" },
    { name: "password", placeholder: "Password", type: "password" },
    { name: "alamat", placeholder: "Alamat" },
    { name: "no_hp", placeholder: "No HP" },
    { name: "nik", placeholder: "NIK" },
    { name: "nip", placeholder: "NIP" },
    { name: "nik_validator", placeholder: "Validator" },
  ],
};

const AddUserModal: React.FC<Props> = ({ open, role, onClose, onSubmit }) => {
  const fields = ROLE_FIELDS[role] ?? [];

  const handleClose = () => {
    onClose();
    window.location.reload();
  };

  const initialForm = Object.fromEntries(fields.map(f => [f.name, ""])) as Partial<AddUserData>;
  const [form, setForm] = useState<Partial<AddUserData>>(initialForm);
  const [validators, setValidators] = useState<User[]>([]);
  const [loadingValidators, setLoadingValidators] = useState(false);

  // track password visibility per-field
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open && role === "teknisi") {
      setLoadingValidators(true);
      getValidators()
        .then(data => setValidators(data))
        .catch(err => {
          console.error("Gagal fetch validator:", err);
          setValidators([]);
        })
        .finally(() => setLoadingValidators(false));
    }
  }, [open, role]);

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Cek field kosong
    const missingFields = fields.filter(f => !form[f.name]);
    if (missingFields.length > 0) {
      alert(`Field wajib: ${missingFields.map(f => f.placeholder).join(", ")}`);
      return;
    }

    try {
      await onSubmit(form as AddUserData);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Gagal menambahkan user";
      alert(msg);
    }
  };


  const togglePassword = (fieldName: string) => {
    setShowPassword(prev => ({ ...prev, [fieldName]: !prev[fieldName] }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-96 p-6 relative">
        <button
          onClick={handleClose}
          className="absolute top-2 left-2 text-gray-500 hover:text-gray-700"
        >
          <X />
        </button>
        <h2 className="text-xl font-bold mb-4 text-center">
          Tambah Akun {role}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {fields.map(field =>
            field.name === "nik_validator" ? (
              <select
                key={field.name}
                name={field.name}
                value={form[field.name] || ""}
                onChange={handleChange}
                className="border rounded px-2 py-1"
                required
                disabled={loadingValidators}
              >
                <option value="">
                  {loadingValidators ? "Memuat validator..." : "Pilih Validator"}
                </option>
                {validators.map(v => (
                  <option key={v.nik} value={v.nik}>
                    {v.nama} ({v.nik})
                  </option>
                ))}
              </select>
            ) : field.type === "password" ? (
              <div key={field.name} className="relative">
                <input
                  type={showPassword[field.name] ? "text" : "password"}
                  name={field.name}
                  placeholder={field.placeholder}
                  value={form[field.name] || ""}
                  onChange={handleChange}
                  className="border rounded px-2 py-1 w-full"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePassword(field.name)}
                  className="absolute right-2 top-2 text-gray-600"
                >
                  {showPassword[field.name] ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            ) : (
              <input
                key={field.name}
                type={field.type ?? "text"}
                name={field.name}
                placeholder={field.placeholder}
                value={form[field.name] || ""}
                onChange={handleChange}
                className="border rounded px-2 py-1"
                required
              />
            )
          )}
          <button
            type="submit"
            className="bg-green-400 text-white py-2 rounded hover:bg-green-500 mt-2"
          >
            Kirim
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
