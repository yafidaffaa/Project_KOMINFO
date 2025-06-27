// src/routes/index.tsx
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPass";
import ResetPassword from "../pages/ResetPass";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/forgotpass" element={<ForgotPassword />} />
    <Route path="/resetpass" element={<ResetPassword />} />
  </Routes>
);

export default AppRoutes;
