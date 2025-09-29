import React from "react";
import ReportsTable from "../superadmin/components/ReportsTable";
import HeaderAdm from "../superadmin/components/HeaderAdm";
import Sidebar from "../superadmin/components/Sidebar";
import ValidatorStats from "./components/validatorstats";
; // ✅ import

const DashboardValidator: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <HeaderAdm />

        {/* Content */}
        <main className="p-6 space-y-6">
          {/* Statistik Aduan */}
          <ValidatorStats />

          {/* Table Laporan */}
          <div className="bg-white rounded-2xl shadow-md p-4">
            <ReportsTable />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardValidator;
