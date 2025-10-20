import React from "react";
import "./css/cssHomePage.css";

const HomePage: React.FC = () => {
  return (
    <div className="homepage">
      <header className="header">
        <h1>Sistema Cultural</h1>
        <nav>
          <a href="/login">Login</a>
        </nav>
      </header>

      <main className="hero">
        <h2>Bem-vindo ao Arquivo Digital de Memória Cultural</h2>
        <p>
          Explore, compartilhe e preserve as histórias culturais de Baraúna e do Nordeste.
        </p>
        <a className="cta-button" href="/registro">
          Comece agora
        </a>
      </main>

      <footer className="footer">
        <p>© 2025 Projeto de Extensão — Arquivo Cultural</p>
      </footer>
    </div>
  );
};

export default HomePage;
