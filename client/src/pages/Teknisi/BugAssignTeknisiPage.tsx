
import HeaderAdm from "../superadmin/components/HeaderAdm";
import Sidebar from "../superadmin/components/Sidebar";
import BugAssignTeknisiTable from "./components/BugAssignTeknisiTable";


const BugAssignTeknisiPage: React.FC = () => {
    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar  />
            <main className="flex-1 p-6 overflow-y-auto">
                <HeaderAdm />
             <BugAssignTeknisiTable />
            </main>
        </div>
    );
};

export default BugAssignTeknisiPage;
