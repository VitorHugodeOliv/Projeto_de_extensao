import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@lib/store/auth-store";
import "../styles/navbar.css";

const Navbar: React.FC = () => {
  const [menuAberto, setMenuAberto] = useState(false);
  const { user, logout, accessToken } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => setMenuAberto(!menuAberto);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (location.pathname === "/") return null;

  return (
    <>
      <div className={`off-screen ${menuAberto ? "active" : ""}`}>
        <ul>
          <li>
            <Link to="/historias" onClick={toggleMenu}>
              Histórias
            </Link>
          </li>
          <li>
            <Link to="/enviar-historia" onClick={toggleMenu}>
              Enviar
            </Link>
          </li>

          {user?.tipo_usuario === "admin" && (
            <li>
              <Link to="/admin" onClick={toggleMenu}>
                Admin
              </Link>
            </li>
          )}

          {accessToken ? (
            <li
              onClick={() => {
                handleLogout();
                toggleMenu();
              }}
              className="logout"
            >
              Sair ({user?.nome ?? "Usuário"})
            </li>
          ) : (
            <>
              <li>
                <Link to="/login" onClick={toggleMenu}>
                  Entrar
                </Link>
              </li>
              <li>
                <Link to="/registro" onClick={toggleMenu}>
                  Registrar
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>

      <nav className="navbar">
        <div className="navbar-logo" onClick={() => navigate("/")}>
          Arquivo Cultural
        </div>

        <ul className="navbar-links">
          <li>
            <Link to="/historias">Histórias</Link>
          </li>
          <li>
            <Link to="/enviar-historia">Enviar</Link>
          </li>

          {user?.tipo_usuario === "admin" && (
            <li>
              <Link to="/admin">Admin</Link>
            </li>
          )}

          {accessToken ? (
            <li className="logout" onClick={handleLogout}>
              Sair ({user?.nome ?? "Usuário"})
            </li>
          ) : (
            <>
              <li>
                <Link to="/login">Entrar</Link>
              </li>
              <li>
                <Link to="/registro">Registrar</Link>
              </li>
            </>
          )}
        </ul>

        <div
          className={`ham-menu ${menuAberto ? "active" : ""}`}
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>

      </nav>
    </>
  );
};

export default Navbar;
