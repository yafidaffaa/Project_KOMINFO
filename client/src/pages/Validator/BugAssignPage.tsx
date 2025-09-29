import React from "react";
import HeaderAdm from "../superadmin/components/HeaderAdm";
import Sidebar from "../superadmin/components/Sidebar";
import BugAssignValidatorTable from "./components/BugAssignValidatorTable";
import BugAssignStats from "./components/BugAssignStats"; // ✅ import

const BugAssignPage: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto space-y-6">
        <HeaderAdm />

        {/* Statistik Bug Assign */}
        <BugAssignStats />

        {/* Tabel Bug Assign */}
        <div className="bg-white rounded-2xl shadow-md p-4">
          <BugAssignValidatorTable />
        </div>
      </main>
    </div>
  );
};

export default BugAssignPage;
