import React from "react";
import { imagens } from "../utils/arrayDeImagens"
import "./css/cssHomePage.css";

const HomePage: React.FC = () => {

  const COLUNAS = 5;
  const imagensPorColuna = 8;

  return (
    <div className="homepage">
      <div className="image-background">
        {Array.from({ length: COLUNAS }).map((_, colIndex) => (
          <div key={colIndex} className="column">
        {imagens.slice(colIndex * imagensPorColuna, colIndex * imagensPorColuna + imagensPorColuna)
        .map((img, i) => <img key={i} src={img} alt="" />)}
      </div>
      ))}
      </div>
      <main className="hero-container">
        <h2>Bem-vindo ao Arquivo Digital de Memória Cultural</h2>
        <p>
          Explore, compartilhe e preserve as histórias culturais de Baraúna e do Nordeste.
        </p>
        <a className="cta-button" href="/login">
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
