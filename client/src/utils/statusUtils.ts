// src/utils/statusUtils.ts
export const statusOptions = [
  { value: "diajukan", label: "Diajukan", color: "text-red-500" },
  { value: "diproses", label: "Proses", color: "text-blue-500" },
  { value: "revisi_by_admin", label: "Revisi Admin", color: "text-yellow-500" },
  { value: "selesai", label: "Selesai", color: "text-green-500" },
  { value: "pendapat_selesai", label: "Pendapat Selesai", color: "text-purple-500" },
];

export const getStatusLabel = (value: string): string => {
  const found = statusOptions.find((s) => s.value === value.toLowerCase());
  return found ? found.label : value;
};

export const getStatusColor = (value: string): string => {
  const found = statusOptions.find((s) => s.value === value.toLowerCase());
  return found ? found.color : "text-gray-500";
};
