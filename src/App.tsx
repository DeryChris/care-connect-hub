import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./contexts/AuthContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { AppLayout } from "./components/layout/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UsersPage from "./pages/UsersPage";
import UserForm from "./pages/UserForm";
import DepartmentsPage from "./pages/DepartmentsPage";
import TasksPage from "./pages/TasksPage";
import TaskForm from "./pages/TaskForm";
import InventoryPage from "./pages/InventoryPage";
import InventoryForm from "./pages/InventoryForm";
import PatientsPage from "./pages/PatientsPage";
import PatientForm from "./pages/PatientForm";
import AppointmentsPage from "./pages/AppointmentsPage";
import AppointmentForm from "./pages/AppointmentForm";
import LaboratoryPage from "./pages/LaboratoryPage";
import PharmacyPage from "./pages/PharmacyPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import OPDPage from "./pages/OPDPage";
import IPDPage from "./pages/IPDPage";
import RadiologyPage from "./pages/RadiologyPage";
import BillingPage from "./pages/BillingPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SettingsProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Protected routes */}
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/users/create" element={<UserForm />} />
                <Route path="/users/:id/edit" element={<UserForm />} />
                <Route path="/departments" element={<DepartmentsPage />} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/tasks/create" element={<TaskForm />} />
                <Route path="/tasks/:id/edit" element={<TaskForm />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/inventory/create" element={<InventoryForm />} />
                <Route path="/inventory/:id/edit" element={<InventoryForm />} />
                <Route path="/patients" element={<PatientsPage />} />
                <Route path="/patients/create" element={<PatientForm />} />
                <Route path="/patients/:id/edit" element={<PatientForm />} />
                <Route path="/appointments" element={<AppointmentsPage />} />
                <Route path="/appointments/create" element={<AppointmentForm />} />
                <Route path="/appointments/:id/edit" element={<AppointmentForm />} />
                <Route path="/laboratory" element={<LaboratoryPage />} />
                <Route path="/pharmacy" element={<PharmacyPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/opd" element={<OPDPage />} />
                <Route path="/ipd" element={<IPDPage />} />
                <Route path="/radiology" element={<RadiologyPage />} />
                <Route path="/billing" element={<BillingPage />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </SettingsProvider>
  </QueryClientProvider>
);

export default App;
