import api from "./api";

export type Validator = {
  nik_validator: string;
  nama: string;
};

export type BugCategory = {
  id: number;
  nama_layanan: string;
  deskripsi: string;
  nik_validator: string;
  createdAt?: string;
  updatedAt?: string;
  validator?: Validator;
};

// Helper untuk mapping data dari API → tipe BugCategory
const mapBugCategory = (item: any): BugCategory => ({
  id: item.id_kategori,
  nama_layanan: item.nama_layanan,
  deskripsi: item.deskripsi,
  nik_validator: item.nik_validator,
  createdAt: item.created_at,
  updatedAt: item.updated_at,
  validator: item.validator
    ? {
        nik_validator: item.validator.nik_validator,
        nama: item.validator.nama,
      }
    : undefined,
});

// Ambil semua kategori
export const fetchBugCategories = async (): Promise<BugCategory[]> => {
  const res = await api.get("/bug-category");
  return res.data.map(mapBugCategory);
};

// Ambil kategori by id
export const fetchBugCategoryById = async (id: number): Promise<BugCategory> => {
  const res = await api.get(`/bug-category/${id}`);
  return mapBugCategory(res.data);
};

// Tambah kategori baru
export const createBugCategory = async (payload: {
  nama_layanan: string;
  deskripsi: string;
  nik_validator: string;
}): Promise<BugCategory> => {
  const res = await api.post("/bug-category", payload);
  return mapBugCategory(res.data);
};

// Update kategori
export const updateBugCategory = async (
  id: number,
  payload: {
    nama_layanan: string;
    deskripsi: string;
    nik_validator: string;
  }
): Promise<BugCategory> => {
  const res = await api.put(`/bug-category/${id}`, payload);
  return mapBugCategory(res.data);
};

// Hapus kategori
export const deleteBugCategory = async (
  id: number
): Promise<{ message: string }> => {
  const res = await api.delete(`/bug-category/${id}`);
  return res.data;
};
