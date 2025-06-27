import React from "react";
import InputField from "../components/inputfield";
import logo from '@/assets/logo.png';
import { Link } from 'react-router-dom';

const Login = () => {
    return (
        <div className="flex flex-col md:flex-row min-h-screen">
            {/* Kiri - Gambar / Logo */}
            <div className="w-full md:w-1/2 bg-secondary flex items-center justify-center py-6">
                <img src={logo} alt="Logo" className="w-20 sm:w-24 md:w-48" />
            </div>

            {/* Kanan - Form Login */}
            <div className="w-full md:w-1/2 bg-white flex flex-col justify-center items-center px-6 md:px-10 py-10">
                <h2 className="text-3xl md:text-4xl italic mb-8">Masuk</h2>

                <form className="w-full max-w-sm space-y-4">
                    <InputField id="username" label="Username" />
                    <InputField id="password" label="Password" type="password" />

                    <button
                        type="submit"
                        className="w-full bg-primary hover:bg-secondary text-black font-semibold py-2 rounded-full"
                    >
                        Masuk
                    </button>

                    <div className="text-right">
                        <Link
                            to="/forgotpass"
                            className="text-sm text-blue-600 hover:underline italic"
                        >
                            Lupa Password?
                        </Link>
                    </div>
                </form>

                <p className="mt-6 text-sm text-gray-500">
                    Belum punya akun?{" "}
                    <Link to="/register" className="text-black font-medium hover:underline">
                        Daftar
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
