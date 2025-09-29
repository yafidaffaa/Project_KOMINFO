
import React from "react";
import Sidebar from "../superadmin/components/Sidebar";
import HeaderAdm from "../superadmin/components/HeaderAdm";
import KategoriTable from "../superadmin/components/KategoriTable";




const DashboardAdmin: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <HeaderAdm />
   <KategoriTable />
      </main>
    </div>
  );
};

export default DashboardAdmin;
