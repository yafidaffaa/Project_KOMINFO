// src/services/laporanDiterimaService.ts
import api from "./api";

// ---------- Interfaces ----------
export interface BugCategory {
  id_kategori: number;
  nama_layanan: string;
}

export interface UserUmum {
  nama: string;
}

export interface BugReportSimple {
  id_bug_report: number;
  deskripsi: string;
  tanggal_laporan: string;
  status: string;
  photo_bug: string; // "ada" | "tidak ada"
  nik_user?: string | null;
  nik_pencatat?: string | null;
  nik_admin_sa?: string | null;
  UserUmum?: UserUmum | null;
  Pencatat?: { nama: string } | null;
  AdminSA?: { nama: string } | null;
}

export interface Teknisi {
  nik_teknisi: string;
  nama: string;
  email?: string;
}

export interface Validator {
  nik_validator: string;
  nama: string;
  email?: string;
}

export interface PhotoInfo {
  has_photo: boolean;
  photo_count: number;
  photo_endpoint: string;
  can_view_photos: boolean;
}

export interface BugAssign {
  id_bug_assign: number;
  id_bug_category: number;
  deskripsi: string;
  photo_bug: string; // "ada" | "tidak ada"
  tanggal_penugasan: string;
  status: string;
  id_bug_report: number;
  nama_pelapor: string;
  ket_validator: string | null;
  validasi_validator: string | null;
  catatan_teknisi: string | null;
  nik_teknisi: string | null;
  nik_validator: string | null;
  created_at: string;
  updated_at: string;

  BugReport: BugReportSimple;
  BugCategory: BugCategory;
  Teknisi: Teknisi | null;
  Validator: Validator | null;
  photo_info: PhotoInfo;
}

export interface BugAssignUpdateRequest {
  status?: string;
  catatan_teknisi?: string;
  ket_validator?: string;
  validasi_validator?: string;
}

export interface BugPhoto {
  id_bug_photo: number;
  photo_url: string;
  photo_name: string;
  urutan: number;
  created_at: string;
}

export interface BugPhotoResponse {
  id_bug_report: number;
  total_photos: number;
  photos: BugPhoto[];
}

// ---------- Service Functions ----------

// GET all bug-assign
export const fetchLaporanDiterima = async (): Promise<BugAssign[]> => {
  try {
    const token = localStorage.getItem("jwtToken");
    const { data } = await api.get<BugAssign[]>("/bug-assign", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch laporan diterima:", error);
    return [];
  }
};

// GET bug-assign by ID
export const fetchLaporanDiterimaById = async (
  id: number | string
): Promise<BugAssign | null> => {
  try {
    const token = localStorage.getItem("jwtToken");
    const { data } = await api.get<BugAssign>(`/bug-assign/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch laporan diterima detail:", error);
    return null;
  }
};

// UPDATE bug-assign
export const updateLaporanDiterima = async (
  id: number | string,
  payload: BugAssignUpdateRequest
): Promise<BugAssign | null> => {
  try {
    const token = localStorage.getItem("jwtToken");
    const { data } = await api.put<BugAssign>(`/bug-assign/${id}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    console.error("Gagal update laporan diterima:", error);
    throw error;
  }
};

// DELETE bug-assign
export const hapusLaporanDiterima = async (
  id: number | string
): Promise<boolean> => {
  try {
    const token = localStorage.getItem("jwtToken");
    await api.delete(`/bug-assign/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return true;
  } catch (error) {
    console.error("Gagal menghapus laporan diterima:", error);
    return false;
  }
};

// GET foto bug-report
export const fetchBugPhotos = async (
  id_bug_report: number
): Promise<BugPhotoResponse | null> => {
  try {
    const token = localStorage.getItem("jwtToken");
    const { data } = await api.get<BugPhotoResponse>(
      `/bug-photos/bug-report/${id_bug_report}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return data;
  } catch (error) {
    console.error("Gagal mengambil foto bug:", error);
    return null;
  }
};
