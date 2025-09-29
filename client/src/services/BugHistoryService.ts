// bugHistory.ts
import api from "./api";

export interface Bug {
  id_bug_report: number;
  id_bug_category: number;
  deskripsi: string;
  tanggal_laporan: string;
  nik_user: string;
  nik_pencatat?: string | null;
  nik_admin_sa?: string | null;
  status: string;
  photo_bug?: string[] | null;
  ket_validator?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Timeline {
  id_history: number;
  id_bug_report: number;
  id_akun: number;
  status: string;
  keterangan?: string | null;
  tanggal: string;
  Akun: {
    id_akun: number;
    username: string;
    role: string;
  };
}

export interface BugHistoryResponse {
  bug: Bug;
  timeline: Timeline[];
}

// GET /bug-history/:id
export const fetchBugHistoryById = async (
  id: number | string
): Promise<BugHistoryResponse> => {
  try {
    const res = await api.get<BugHistoryResponse>(`/bug-history/${id}`);
    return res.data;
  } catch (err) {
    console.error("Error fetching bug history:", err);
    throw err;
  }
};
