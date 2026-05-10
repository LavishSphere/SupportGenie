import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import TicketsPage from "./pages/TicketsPage";
import TicketDetailPage from "./pages/TicketDetailPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/tickets" element={<TicketsPage />} />
        <Route path="/tickets/:id" element={<TicketDetailPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/tickets" replace />} />
    </Routes>
  );
}
