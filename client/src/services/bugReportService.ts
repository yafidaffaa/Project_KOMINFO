import api from "./api";

/* ============================
   Interfaces
============================ */
export interface BugCategory {
  id_kategori: number;
  nama_layanan: string;
}

export interface UserUmum {
  nik_user: string;
  nama: string;
}

export interface PhotoInfo {
  has_photo: boolean;
  photo_count: number;
  photo_endpoint: string | null;
  can_view_photos: boolean;
  can_upload_photos?: boolean;
  can_delete_photos?: boolean;
}

export interface BugReport {
  id_bug_report: number;
  id_bug_category: number;
  deskripsi: string;
  tanggal_laporan: string;
  status: string;
  nik_user: string | null;
  nik_pencatat: string | null;
  nik_admin_sa: string | null;
  ket_validator: string | null;
  created_at: string;
  updated_at: string;

  BugCategory: BugCategory;
  UserUmum: UserUmum | null;
  Pencatat: UserUmum | null;
  AdminSA: UserUmum | null;

  photo_bug: "ada" | "tidak ada";
  photo_info: PhotoInfo;

  nama_pelapor: string | null;
}

export interface BugReportRequest {
  deskripsi: string;
  id_bug_category: number;
  photo_bug?: string[];
}

/* ============================
   Helpers
============================ */
// // File → Base64 (kalau butuh)
// const fileToBase64 = (file: File): Promise<string> => {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.readAsDataURL(file);
//     reader.onload = () => resolve(reader.result as string);
//     reader.onerror = (err) => reject(err);
//   });
// };

/* ============================
   API Services
============================ */

// GET bug reports (all)
export const fetchBugReports = async (): Promise<BugReport[]> => {
  try {
    const token = localStorage.getItem("jwtToken");
    const { data } = await api.get<BugReport[]>("/bug-report", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch bug reports:", error);
    return [];
  }
};

// GET bug report by ID
export const fetchBugReportById = async (
  id: number | string
): Promise<BugReport | null> => {
  try {
    const token = localStorage.getItem("jwtToken");
    const { data } = await api.get<BugReport>(`/bug-report/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch bug report detail:", error);
    return null;
  }
};

// POST bug report (pakai FormData)
export const kirimLaporanBug = async (
  deskripsi: string,
  id_kategori: number,
  files?: File[]
) => {
  try {
    const token = localStorage.getItem("jwtToken");
    const formData = new FormData();

    formData.append("deskripsi", deskripsi);
    formData.append("id_bug_category", id_kategori.toString());

    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append("photos", file);
        // ⬆️ tetap FormData, bukan array biasa
      });
    }

    const { data } = await api.post("/bug-report", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return data;
  } catch (error) {
    console.error("Error kirim laporan:", error);
    throw error;
  }
};


// DELETE bug report by ID
export const hapusBugReport = async (id: number | string): Promise<boolean> => {
  try {
    const token = localStorage.getItem("jwtToken");
    await api.delete(`/bug-report/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return true;
  } catch (error) {
    console.error("Gagal menghapus bug report:", error);
    return false;
  }
};

// PUT bug report by ID (pakai FormData biar bisa update foto juga)
export const updateBugReport = async (
  id: number | string,
  deskripsi?: string,
  id_bug_category?: number,
  status?: string,
  ket_validator?: string,
  files?: FileList | null
) => {
  try {
    const token = localStorage.getItem("jwtToken");
    const formData = new FormData();

    if (deskripsi) formData.append("deskripsi", deskripsi);
    if (id_bug_category)
      formData.append("id_bug_category", id_bug_category.toString());
    if (status) formData.append("status", status);
    if (ket_validator) formData.append("ket_validator", ket_validator);

    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        formData.append("photos", file);
      });
    }

    const { data } = await api.put(`/bug-report/${id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return data;
  } catch (error) {
    console.error("Gagal update bug report:", error);
    throw error;
  }
};

/* ============================
   Extra: Photo Helpers
============================ */

// services/bugReportService.ts
export const getBugReportPhotos = async (bug: BugReport): Promise<string[] | null> => {
  if (!bug.photo_info?.photo_endpoint) return null;

  try {
    const token = localStorage.getItem("jwtToken");
    const { data } = await api.get(bug.photo_info.photo_endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // mapping array photos ke array string url
    if (data && data.photos) {
      return data.photos.map((p: any) => p.photo_url);
    }

    return null;
  } catch (error) {
    console.error("Gagal mengambil foto bug report:", error);
    return null;
  }
};

