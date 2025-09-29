import React from "react";
import { useSearchParams } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import UserTable from "./components/UserTable";
import type { UserRole } from "../../services/userService";
import HeaderAdm from "./components/HeaderAdm";

const UserManagement: React.FC = () => {
    const [searchParams] = useSearchParams();
    const roleParam = searchParams.get("role") as UserRole | null;

    const selectedRole: UserRole = roleParam || "masyarakat";

    return (
        <div className="flex min-h-screen  bg-gray-100">
            <Sidebar />
            <main className="flex-1 p-6 overflow-y-auto">
                <HeaderAdm />
                <UserTable role={selectedRole} />
            </main>
        </div>
    );
};

export default UserManagement;
