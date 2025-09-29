import React from "react";

import KategoriTable from "./components/KategoriTable";

import HeaderAdm from "./components/HeaderAdm";
import Sidebar from "./components/Sidebar";

const KategoriPage: React.FC = () => {
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

export default KategoriPage;
