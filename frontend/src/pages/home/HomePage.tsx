import React, { useEffect, useState } from "react";
import styles from "./HomePage.module.css";

import Navbar from "@features/navigation/components/NavBarHome";

import img1 from "@assets/imagens/imagens (1).png";
import img2 from "@assets/imagens/imagens (20).png";
import img3 from "@assets/imagens/imagens (7).png";
import img4 from "@assets/imagens/imagens (19).png";

const imagens = [img1, img2, img3, img4];

const HomePage: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % imagens.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.page}>

      <Navbar />

      <div className={styles.hero}>
        {imagens.map((img, i) => (
          <img
            key={"bg-" + i}
            src={img}
            alt=""
            className={`${styles.heroBg} ${i === index ? styles.activeBg : ""}`}
          />
        ))}
        {imagens.map((img, i) => (
          <img
            key={i}
            src={img}
            alt=""
            className={`${styles.heroImage} ${i === index ? styles.active : ""}`}
          />
        ))}
        <div className={styles.heroTop}>
            <div className={styles.line1}>EXPLORE</div>
            <div className={styles.line2}>COMPARTI</div>
            <div className={styles.line3}>LHE</div>
            <div className={styles.line4}>E PRESERVE</div>
        </div>

        <div className={styles.heroBottom}>
            <div className={styles.b1}>HISTÓRIAS</div>
            <div className={styles.b2}>DE BARAÚNA</div>
            <div className={styles.b3}>E DO</div>
            <div className={styles.b4}>NORDESTE</div>
        </div>
      </div>

      <footer className={styles.footer}>
        2025 — Projeto de Extensão Arquivo Cultural
      </footer>
    </div>
  );
};

export default HomePage;