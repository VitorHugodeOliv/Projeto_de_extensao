import React from "react";
import { Route, Routes } from "react-router";
import RotaLogin from "./routes/RotaLogin";
import RotaRegistro from "./routes/RotaRegistro";

const App: React.FC = () => {

  return (
    <Routes>
      <Route path="/login" element={<RotaLogin/>}/>
      <Route path="/registro" element={<RotaRegistro/>}/>
    </Routes>
    
  );
};

export default App;
