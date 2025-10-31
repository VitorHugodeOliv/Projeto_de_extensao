import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../css/cssNavbar.css";
import { apiAuth } from "../../apis/api";

interface Usuario {
  id: number;
  nome: string;
  tipo_usuario: string;
}

interface DecodedToken {
  id: number;
  nome: string;
  tipo_usuario: string;
  exp: number;
}

const Navbar: React.FC = () => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [menuAberto, setMenuAberto] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => setMenuAberto(!menuAberto);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUsuario(null);
      return;
    }

    try {
      const decoded: DecodedToken = jwtDecode(token);
      const agora = Date.now() / 1000;

      if (decoded.exp < agora) {
        localStorage.removeItem("token");
        setUsuario(null);
        setMensagem("Sessão expirada. Faça login novamente.");
        return;
      }

      apiAuth
        .perfil()
        .then((dados) => {
          setUsuario({
            id: dados.id,
            nome: dados.nome,
            tipo_usuario: dados.tipo_usuario,
          });
        })
        .catch(() => {
          setUsuario({
            id: decoded.id,
            nome: decoded.nome,
            tipo_usuario: decoded.tipo_usuario,
          });
        });
    } catch (err) {
      console.error("Erro ao decodificar token:", err);
      setUsuario(null);
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setUsuario(null);
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

          {usuario?.tipo_usuario === "admin" && (
            <li>
              <Link to="/admin" onClick={toggleMenu}>
                Admin
              </Link>
            </li>
          )}

          {usuario ? (
            <li
              onClick={() => {
                handleLogout();
                toggleMenu();
              }}
              className="logout"
            >
              Sair ({usuario.nome})
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

          {usuario?.tipo_usuario === "admin" && (
            <li>
              <Link to="/admin">Admin</Link>
            </li>
          )}

          {usuario ? (
            <li className="logout" onClick={handleLogout}>
              Sair ({usuario.nome})
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

        {mensagem && <small className="navbar-erro">{mensagem}</small>}
      </nav>
    </>
  );
};

export default Navbar;
