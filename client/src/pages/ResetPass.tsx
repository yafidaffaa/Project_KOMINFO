import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import lockpass from "@/assets/lockpass.png";
import InputField from "../components/inputfield";
import { resetPassword } from "../services/authService";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Password tidak cocok!");
      return;
    }

    if (!token) {
      alert("Token tidak valid!");
      return;
    }

    try {
      const res = await resetPassword(token, password);
      alert(res.message);
      navigate("/login");
    } catch (error: any) {
      alert(error.response?.data?.message || "Gagal reset password");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-white px-4">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 text-black"
      >
        <ArrowLeft size={24} />
      </button>

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
          {/* Buat Password Baru */}
          <div className="relative">
            <InputField
              id="new-password"
              label="Buat Password Baru"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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

          {/* Konfirmasi Password Baru */}
          <div className="relative">
            <InputField
              id="confirm-password"
              label="Konfirmasi Password Baru"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-9 text-gray-600"
            >
              {showConfirmPassword ? (
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
            Kirim
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
