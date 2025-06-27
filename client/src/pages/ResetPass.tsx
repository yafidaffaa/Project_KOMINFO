import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import lockpass from "@/assets/lockpass.png";
import InputField from "../components/inputfield";

const ResetPassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert("Password tidak cocok!");
            return;
        }

        // TODO: kirim ke backend
        console.log("Reset password dikirim:", password);
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-white px-4">

            {/* Tombol Back */}
            <button
                onClick={() => navigate(-1)}
                className="absolute top-4 left-4 text-black"
            >
                <ArrowLeft size={24} />
            </button>

            {/* Konten Utama */}
            <div className="w-full max-w-md text-center">
                <img
                    src={lockpass}
                    alt="Reset Password Icon"
                    className="mx-auto mb-6 w-24 h-24 md:w-32 md:h-32"
                />

                <p className="font-semibold text-sm md:text-base mb-6">
                    Password harus memiliki minimal 8 karakter dengan kombinasi huruf besar, huruf kecil, angka, dan simbol.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6 text-left">
                    <InputField
                        id="new-password"
                        label="Buat Password Baru"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <InputField
                        id="confirm-password"
                        label="Konfirmasi Password Baru"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />

                    <button
                        type="submit"
                        className="w-full bg-primary hover:bg-secondary text-black font-semibold py-2 rounded-full"
                    >
                        Kirim
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
