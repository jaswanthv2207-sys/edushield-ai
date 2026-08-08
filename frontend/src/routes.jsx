import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Prediction from "./pages/Prediction";
import ManualPrediction from "./pages/ManualPrediction";
import Analytics from "./pages/Analytics";
import Counselling from "./pages/Counselling";
import Reports from "./pages/Reports";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manual-prediction"
        element={
          <ProtectedRoute>
            <ManualPrediction />
          </ProtectedRoute>
        }
      />

      <Route path="/students" element={<Students />} />
      <Route path="/prediction" element={<Prediction />} />

      {/* NEW PAGE */}
      <Route path="/manual-prediction" element={<ManualPrediction />} />

      <Route path="/analytics" element={<Analytics />} />
      <Route path="/counselling" element={<Counselling />} />
      <Route path="/reports" element={<Reports />} />
    </Routes>
  );
}

export default AppRoutes;
