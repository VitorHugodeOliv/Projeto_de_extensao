import React from "react";
import { Route, Routes } from "react-router";
import RotaLogin from "./routes/RotaLogin";
import RotaRegistro from "./routes/RotaRegistro";
import RotaPerfil from "./routes/RotaPerfil";
import RotaHomePage from "./routes/RotaHomePage";
import RotaDashboard from "./routes/RotaDashboard";
import RotaHistoryRegister from "./routes/RotaHistoryRegister";
import RotaAdminPanel from "./routes/RotaAdminPanel";
import RotaPublicPage from "./routes/RotaPublicPage";
import RotaHeader from "./routes/RotaHeader"
import RotaAdminCard from "./routes/RotaAdminCard"
import HistoryDetails from "./components/HistoryDetails";
import ProtectedRoute from "./routes/ProtectedRoute";

const App: React.FC = () => {

  return (
    <Routes>
      <Route index element={<RotaHomePage/>}/>
      <Route path='/' element={<RotaHeader />}>
        <Route path="/historias" element={<RotaPublicPage/>}/>
        <Route path="/historia/:id" element={<HistoryDetails />} />
        <Route path="/registro" element={<RotaRegistro/>}/>
        <Route path="/login" element={ <RotaLogin/>}/>
        <Route 
          path="/dashboard" 
          element={
          <ProtectedRoute>
            <RotaDashboard/>
          </ProtectedRoute>}/>
        <Route 
          path="/enviar-historia" 
          element={ 
          <ProtectedRoute>
            <RotaHistoryRegister/>
          </ProtectedRoute>}/>
        <Route 
          path="/perfil"
          element={ 
          <ProtectedRoute>
            <RotaPerfil/>
          </ProtectedRoute>}/>
        <Route 
          path="/admin"
          element={ 
          <ProtectedRoute requerAdmin>
            <RotaAdminPanel/>
          </ProtectedRoute>}/>
        <Route
          path="/admin-card/:id"
          element={ 
          <ProtectedRoute requerAdmin>
            <RotaAdminCard/>
          </ProtectedRoute>}/>
      </Route>    
    </Routes>
  );
};

export default App;