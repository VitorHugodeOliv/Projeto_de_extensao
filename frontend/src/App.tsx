import React from "react";
import { Route, Routes } from "react-router";
import ToastProvider from "@providers/ToastProvider";
import AppLayout from "@layouts/AppLayout";
import ProtectedRoute from "@layouts/ProtectedRoute";
import HomePage from "@pages/home/HomePage";
import LoginPage from "@pages/auth/LoginPage";
import RegisterPage from "@pages/auth/RegisterPage";
import RegistrationConfirmationPage from "@pages/auth/RegistrationConfirmationPage";
import DashboardPage from "@pages/dashboard/DashboardPage";
import StorySubmissionPage from "@pages/stories/StorySubmissionPage";
import PublicStoriesPage from "@pages/stories/PublicStoriesPage";
import AdminPanelPage from "@pages/admin/AdminPanelPage";
import AdminStoryDetailsPage from "@pages/admin/AdminStoryDetailsPage";
import HistoryDetails from "@features/stories/components/HistoryDetails";
import Confirmado from "@features/auth/components/Confirmado";
import ErroConfirmacao from "@features/auth/components/ErroConfirmacao";
import ForgottenPassword from "@features/auth/components/password-recovery/ForgottenPassword";
import PasswordReset from "@features/auth/components/password-recovery/PasswordReset";

const App: React.FC = () => {
  return (
    <>
      <ToastProvider />
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="historias" element={<PublicStoriesPage />} />
          <Route path="historia/:id" element={<HistoryDetails />} />
          <Route path="registro" element={<RegisterPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="registro-confirmado" element={<RegistrationConfirmationPage />} />
          <Route path="confirmado" element={<Confirmado />} />
          <Route path="erro-confirmacao" element={<ErroConfirmacao />} />
          <Route path="esqueci-senha" element={<ForgottenPassword />} />
          <Route path="resetar-senha/:token" element={<PasswordReset />} />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="enviar-historia"
            element={
              <ProtectedRoute>
                <StorySubmissionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin"
            element={
              <ProtectedRoute requerAdmin>
                <AdminPanelPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin-card/:id"
            element={
              <ProtectedRoute requerAdmin>
                <AdminStoryDetailsPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </>
  );
};

export default App;