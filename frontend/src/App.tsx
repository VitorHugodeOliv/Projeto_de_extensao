import React from "react";
import { Route, Routes } from "react-router";
import RotaLogin from "./routes/RotaLogin";
import RotaRegistro from "./routes/RotaRegistro";
import RotaDashboard from "./routes/RotaDashboard";
import RotaHomePage from "./routes/RotaHomePage";

const App: React.FC = () => {

  return (
    <Routes>
      <Route path="/" element={<RotaHomePage/>}/>
      <Route path="/login" element={<RotaLogin/>}/>
      <Route path="/registro" element={<RotaRegistro/>}/>
      <Route path="/dashboard" element={ <RotaDashboard/>}/>
    </Routes>
  );
};

export default App;