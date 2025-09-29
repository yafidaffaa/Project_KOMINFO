
import React from "react";
import HeaderAdm from "./components/HeaderAdm";
import StatsCards from "./components/StatsCards";
import Sidebar from "./components/Sidebar";


const Dashboardsa: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <HeaderAdm />
        <StatsCards />
      </main>
    </div>
  );
};

export default Dashboardsa;
