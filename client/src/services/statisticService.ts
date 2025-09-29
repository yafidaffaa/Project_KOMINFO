import api from "./api";


export interface DashboardStatistic {
  totalUser: number;
  totalUserUmum: number;
  totalPencatat: number;
  totalValidator: number;
  totalAdminKategori: number;
  totalTeknisi: number;
}

export interface BugReportStatistic {
  tahun: number;
  total: number;
  diajukan: number;
  diproses: number;
  selesai: number;
  pendapat_selesai: number;
}

export interface BugAssignStatistic {
  tahun: number;
  total: number;
  diproses: number;
  selesai: number;
  pendapat_selesai: number;
}

export interface AllStatistic {
  dashboard: DashboardStatistic;
  bugReport: BugReportStatistic;
  bugAssign: BugAssignStatistic;
}

export const getDashboardStatistic = async (): Promise<DashboardStatistic> => {
  const res = await api.get<DashboardStatistic>("/admin-sa/dashboard-statistic");
  return res.data;
};

export const getBugReportStatistic = async (
  tahun: number
): Promise<BugReportStatistic> => {
  const res = await api.get<BugReportStatistic>(`/bug-report/statistik?tahun=${tahun}`);
  return res.data;
};

export const getBugAssignStatistic = async (
  tahun: number
): Promise<BugAssignStatistic> => {
  const res = await api.get<BugAssignStatistic>(`/bug-assign/statistik?tahun=${tahun}`);
  return res.data;
};

export const getAllStatistic = async (tahun: number): Promise<AllStatistic> => {
  const [dashboard, bugReport, bugAssign] = await Promise.all([
    getDashboardStatistic(),
    getBugReportStatistic(tahun),
    getBugAssignStatistic(tahun),
  ]);

  return { dashboard, bugReport, bugAssign };
};
