

import HeaderAdm from "./components/HeaderAdm";
import ReportsTable from "./components/ReportsTable";
import Sidebar from "./components/Sidebar";

const ReportPageSA: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <HeaderAdm />
        <ReportsTable />
      </main>
    </div>
  );
};

export default ReportPageSA;
