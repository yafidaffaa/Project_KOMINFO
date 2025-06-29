// src/routes/index.tsx
import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPass";
import ResetPassword from "../pages/ResetPass";
import LandingPage from "../pages/LandingPage";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<LandingPage  />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/forgotpass" element={<ForgotPassword />} />
    <Route path="/resetpass" element={<ResetPassword />} />
  </Routes>
);

export default AppRoutes;
