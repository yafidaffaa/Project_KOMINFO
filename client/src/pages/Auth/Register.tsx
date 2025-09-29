// src/pages/Register.tsx

import React, { useState } from "react";
import logo from '@/assets/logo.png';
import { useNavigate } from "react-router-dom";
import type { RegisterRequest } from "../../features/auth/authTypes";
import { register } from "../../services/authService";
import InputField from "../../components/inputfield";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<RegisterRequest>({
    username: "",
    password: "",
    konfirmasiPassword: "",
    nama: "",
    nik_user: "",
    email: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.konfirmasiPassword) {
      alert("Password dan Konfirmasi Password tidak cocok");
      return;
    }

    const requestData = { ...formData, konfirmasiPassword: formData.konfirmasiPassword };
    console.log("Request yang dikirim ke server:", requestData);

    try {
      const res = await register(formData);
      alert(res.message);
      navigate("/login");
    } catch (err) {
      console.error("Registrasi gagal:", err);
      alert("Registrasi gagal. Cek data Anda.");
    }
  };

  return (
    <div className="grid md:grid-cols-2 min-h-screen">

      {/* Logo */}
      <div className="bg-secondary flex items-center justify-center py-6 md:py-0 md:min-h-screen order-1 md:order-2">
        <img src={logo} alt="Logo" className="w-20 sm:w-24 md:w-48" />
      </div>

      {/* Formulir */}
      <div className="bg-white flex flex-col justify-center items-center px-6 md:px-10 py-10 order-2 md:order-1">
        <h2 className="text-3xl md:text-4xl italic mb-8">Daftar</h2>

        <form className="w-full max-w-sm space-y-4" onSubmit={handleSubmit}>
          <InputField id="nik_user" label="NIK" value={formData.nik_user} onChange={handleChange} />
          <InputField id="nama" label="Nama" value={formData.nama} onChange={handleChange} />
          <InputField id="email" label="Email" value={formData.email} onChange={handleChange} />
          <InputField id="username" label="Username" value={formData.username} onChange={handleChange} />

          {/* Password */}
          <div className="relative">
            <InputField
              id="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-600"
            >
           {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Konfirmasi Password */}
          <div className="relative">
            <InputField
              id="konfirmasiPassword"
              label="Konfirmasi Password"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.konfirmasiPassword}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-9 text-gray-600"
            >
               {showPassword ? (
                             <EyeSlashIcon className="h-5 w-5" />
                           ) : (
                             <EyeIcon className="h-5 w-5" />
                           )}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-secondary text-black font-semibold py-2 rounded-full"
          >
            Daftar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
