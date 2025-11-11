import React from "react";
import { Route, Routes } from "react-router";
import ToastProvider from './utils/ToastProvider'
import RotaLogin from "./routes/RotaLogin";
import RotaRegistro from "./routes/RotaRegistro";
import RotaHomePage from "./routes/RotaHomePage";
import RotaDashboard from "./routes/RotaDashboard";
import RotaHistoryRegister from "./routes/RotaHistoryRegister";
import RotaAdminPanel from "./routes/RotaAdminPanel";
import RotaPublicPage from "./routes/RotaPublicPage";
import RotaHeader from "./routes/RotaHeader";
import RotaAdminCard from "./routes/RotaAdminCard";
import HistoryDetails from "./components/HistoryDetails";
import ProtectedRoute from "./routes/ProtectedRoute";
import RegistroConfirmado from "./components/RegistroConfirmado";
import Confirmado from "./components/Confirmado";
import ErroConfirmacao from "./components/ErroConfirmacao";
import ForgottenPassword from "./components/passwordRecovery/ForgottenPassword";
import PasswordReset from "./components/passwordRecovery/PasswordReset";

const App: React.FC = () => {
  // vou mudar aqui só pelo commit

  return (
      <>
        <Routes>
          <Route index element={<RotaHomePage />} />
          <Route path='/' element={<RotaHeader />}>
            <Route path="/historias" element={<RotaPublicPage />} />
            <Route path="/historia/:id" element={<HistoryDetails />} />
            <Route path="/registro" element={<RotaRegistro />} />
            <Route path="/login" element={<RotaLogin />} />
            <Route path="registro-confirmado" element={ <RegistroConfirmado />} />
            <Route path="confirmado" element={ <Confirmado />} />
            <Route path="/erro-confirmacao" element={<ErroConfirmacao />} />
            <Route path="/esqueci-senha" element={ <ForgottenPassword />} />
            <Route path="/resetar-senha/:token" element={ <PasswordReset />} />
            <Route
              path="/dashboard"
              element={<ProtectedRoute>
                <RotaDashboard />
              </ProtectedRoute>} />
            <Route
              path="/enviar-historia"
              element={<ProtectedRoute>
                <RotaHistoryRegister />
              </ProtectedRoute>} />
            <Route
              path="/admin"
              element={<ProtectedRoute requerAdmin>
                <RotaAdminPanel />
              </ProtectedRoute>} />
            <Route
              path="/admin-card/:id"
              element={<ProtectedRoute requerAdmin>
                <RotaAdminCard />
              </ProtectedRoute>} />
          </Route>
        </Routes>
        <ToastProvider/>
    </>
  );
};

export default App;