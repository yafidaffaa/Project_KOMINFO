import React from "react";
import logo from "@/assets/logo.png";
import { User } from "lucide-react";



const Header = ({ username = "Guest" }: { username?: string }) => {
    return (
        <div className="bg-white border-b border-gray-300">
            <div className="flex items-center justify-between px-4 md:px-10 py-3">
                <div className="flex items-center gap-3">
                    <img src={logo} alt="Logo" className="w-8 md:w-10" />
                    <h1 className="text-xs md:text-sm font-semibold leading-tight text-black">
                        DINAS KOMUNIKASI DAN INFORMATIKA<br />PERSANDIAN YOGYAKARTA
                    </h1>
                </div>
                <div className="flex items-center gap-2 text-sm text-black">
                    <User size={20} />
                    <span>{username}</span>
                </div>
            </div>
            <div className="bg-primary h-12 w-full" />
        </div>
    );
};

export default Header;
