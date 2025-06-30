// src/routes/index.tsx
import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPass";
import ResetPassword from "../pages/ResetPass";
import Home from "../pages/Home";
import DashboadWarga from "../pages/Warga/DashboardWarga";
import FormPengaduan from "../pages/Warga/FormPengaduan";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/forgotpass" element={<ForgotPassword />} />
    <Route path="/resetpass" element={<ResetPassword />} />
    <Route path="/warga" element={<DashboadWarga />} />
    <Route path="/formaduan" element={<FormPengaduan />} />
  </Routes>
);

export default AppRoutes;
