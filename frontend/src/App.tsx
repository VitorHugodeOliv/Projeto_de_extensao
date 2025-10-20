import React from "react";
import { Route, Routes } from "react-router";
import RotaLogin from "./routes/RotaLogin";
import RotaRegistro from "./routes/RotaRegistro";
import RotaPerfil from "./routes/RotaPerfil";
import RotaHomePage from "./routes/RotaHomePage";
import RotaDashboard from "./routes/RotaDashboard";

const App: React.FC = () => {

  return (
    <Routes>
      <Route path="/" element={<RotaHomePage/>}/>
      <Route path="/login" element={<RotaLogin/>}/>
      <Route path="/registro" element={<RotaRegistro/>}/>
      <Route path="/dashboard" element={ <RotaDashboard/>}/>
      <Route path="/perfil" element={ <RotaPerfil/>}/>      
    </Routes>
  );
};

export default App;