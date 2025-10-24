import { Outlet } from "react-router-dom";
import Navigate from "../components/nav/Navbar";


function Header() {

return (
    <div>
        <header>
            <Navigate />
        </header>
        <Outlet />
    </div>
);
}

export default Header;