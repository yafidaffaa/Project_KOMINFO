import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import lockpass from "@/assets/lockpass.png";
import InputField from "../components/inputfield";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Email dikirim:", email);
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-white px-4">

            {/* Tombol kembali di pojok kiri atas */}
            <button
                onClick={() => navigate(-1)}
                className="absolute top-4 left-4 text-black"
            >
                <ArrowLeft size={24} />
            </button>

            {/* Konten utama */}
            <div className="w-full max-w-md">
                <img
                    src={lockpass}
                    alt="Reset Password Icon"
                    className="mx-auto mb-6 w-24 h-24 md:w-32 md:h-32"
                />

                <p className="font-semibold text-sm md:text-base mb-6 text-center">
                    Silakan masukkan alamat email Anda. Kami akan mengirimkan tautan untuk mereset password Anda melalui email.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <InputField
                        id="email"
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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

export default ForgotPassword;
