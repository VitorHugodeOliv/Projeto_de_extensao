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

const App: React.FC = () => {

  return (
    <Routes>
      <Route index element={<RotaHomePage/>}/>
      <Route path='/' element={<RotaHeader />}>
        <Route path="/historias" element={<RotaPublicPage/>}/>
        <Route path="/login" element={<RotaLogin/>}/>
        <Route path="/registro" element={<RotaRegistro/>}/>
        <Route path="/dashboard" element={ <RotaDashboard/>}/>
        <Route path="/perfil" element={ <RotaPerfil/>}/>
        <Route path="/enviar-historia" element={ <RotaHistoryRegister/>}/>
        <Route path="/admin" element={ <RotaAdminPanel/>}/>
        <Route path="/admin-card/:id" element={ <RotaAdminCard/>}/>
      </Route>    
    </Routes>
  );
};

export default App;