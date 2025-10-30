import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../../apis/apiAxios";
import "../css/cssNavbar.css";

interface Usuario {
  id: number;
  nome: string;
  tipo_usuario: string;
}

const Navbar: React.FC = () => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [menuAberto, setMenuAberto] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => setMenuAberto(!menuAberto);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUsuario(null);
      return;
    }

    const fetchPerfil = async () => {
      try {
        const res = await api.get("http://localhost:5000/perfil", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsuario(res.data);
      } catch (err: unknown) {
        console.error(err);
        setMensagem("Erro ao carregar perfil.");
      }
    };
    fetchPerfil();
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUsuario(null);
    navigate("/login");
  };

  if (location.pathname === "/") return null;

  return (
    <>
      <div className={`off-screen ${menuAberto ? "active" : ""}`}>
        <ul>
          <li><Link to="/historias" onClick={toggleMenu}>Histórias</Link></li>
          <li><Link to="/enviar-historia" onClick={toggleMenu}>Enviar</Link></li>

          {usuario?.tipo_usuario === "admin" && (
            <li><Link to="/admin" onClick={toggleMenu}>Admin</Link></li>
          )}

          {usuario ? (
            <li onClick={() => { handleLogout(); toggleMenu(); }} className="logout">
              Sair ({usuario.nome})
            </li>
          ) : (
            <>
              <li><Link to="/login" onClick={toggleMenu}>Entrar</Link></li>
              <li><Link to="/registro" onClick={toggleMenu}>Registrar</Link></li>
            </>
          )}
        </ul>
      </div>

      <nav className="navbar">
        <div className="navbar-logo" onClick={() => navigate("/")}>
          Arquivo Cultural
        </div>

        <ul className="navbar-links">
          <li><Link to="/historias">Histórias</Link></li>
          <li><Link to="/enviar-historia">Enviar</Link></li>

          {usuario?.tipo_usuario === "admin" && (
            <li><Link to="/admin">Admin</Link></li>
          )}

          {usuario ? (
            <li className="logout" onClick={handleLogout}>
              Sair ({usuario.nome})
            </li>
          ) : (
            <>
              <li><Link to="/login">Entrar</Link></li>
              <li><Link to="/registro">Registrar</Link></li>
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
