// src/routes/index.tsx
import { Routes, Route } from "react-router-dom";

import ForgotPassword from "../pages/ForgotPass";
import ResetPassword from "../pages/ResetPass";
import Home from "../pages/Home";
import DashboadWarga from "../pages/Warga/DashboardWarga";
import FormPengaduan from "../pages/Warga/FormPengaduan";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import TentangKami from "../pages/TentangKami";
import DaftarAduan from "../pages/DaftarAduan";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/forgotpass" element={<ForgotPassword />} />
    <Route path="/resetpass" element={<ResetPassword />} />
    <Route path="/warga" element={<DashboadWarga />} />
    <Route path="/formaduan" element={<FormPengaduan />} />
    <Route path="/daftaraduan" element={<DaftarAduan />} />
    <Route path="/tentangkami" element={<TentangKami />} />
  </Routes>
);

export default AppRoutes;
