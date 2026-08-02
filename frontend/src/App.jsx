import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";

import Landing from "./pages/Landing";
import Explore from "./pages/Explore";
import PollDetail from "./pages/PollDetail";
import Analytics from "./pages/Analytics";
import CreatePoll from "./pages/CreatePoll";
import Dashboard from "./pages/Dashboard";
import MyPolls from "./pages/MyPolls";
import Voted from "./pages/Voted";
import Saved from "./pages/Saved";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyOTP from "./pages/auth/VerifyOTP";
import VerifyForgotOtp from "./pages/auth/VerifyOTP";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

export default function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: { background: "#18181B", color: "#F4F4F5", border: "1px solid #27272A" },
        }}
      />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/verify-forgot-otp" element={<VerifyForgotOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route element={<MainLayout />}>
          <Route path="/explore" element={<Explore />} />
          <Route path="/polls/:id" element={<PollDetail />} />
          <Route path="/polls/:id/analytics" element={<Analytics />} />
          <Route path="/profile/:username" element={<Profile />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/polls/create" element={<CreatePoll />} />
            <Route path="/my-polls" element={<MyPolls />} />
            <Route path="/voted" element={<Voted />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}
