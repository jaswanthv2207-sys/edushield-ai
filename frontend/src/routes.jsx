import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Prediction from "./pages/Prediction";
import Analytics from "./pages/Analytics";
import Counselling from "./pages/Counselling";
import Reports from "./pages/Reports";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />

      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/students" element={<Students />} />
      <Route path="/prediction" element={<Prediction />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/counselling" element={<Counselling />} />
      <Route path="/reports" element={<Reports />} />
    </Routes>
  );
}
