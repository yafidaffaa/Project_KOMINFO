import BugAssignTable from "./components/BugAssignTable";
import HeaderAdm from "./components/HeaderAdm";
import Sidebar from "./components/Sidebar";

const AssignPageSA: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <HeaderAdm />
        <BugAssignTable />
      </main>
    </div>
  );
};

export default AssignPageSA;
