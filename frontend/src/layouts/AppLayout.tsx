import { Outlet } from "react-router-dom";
import Navbar from "@features/navigation/components/Navbar";

function AppLayout() {
  return (
    <div>
      <header>
        <Navbar />
      </header>
      <Outlet />
    </div>
  );
}

export default AppLayout;